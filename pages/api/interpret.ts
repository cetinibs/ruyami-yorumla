import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

// Initialize OpenAI client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

type ResponseData = {
  success: boolean;
  interpretation?: string;
  error?: string;
};

export const config = {
  api: {
    bodyParser: true,
    responseLimit: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body'
      });
    }

    const { dream } = req.body;

    if (!dream || typeof dream !== 'string' || dream.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Dream text is required'
      });
    }

    // OpenAI API request with timeout
    const prompt = `Aşağıdaki rüyayı Türkçe olarak detaylı bir şekilde yorumla. 
    Rüya içeriği: "${dream.trim()}"
    
    Lütfen yorumunu şu başlıklar altında yap:
    1. Genel Yorum
    2. Psikolojik Analiz
    3. Semboller ve Anlamları
    4. Öneriler`;

    let completion;
    try {
      // Create a promise that rejects in 25 seconds
      const timeout = new Promise((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error('OpenAI API zaman aşımına uğradı'));
        }, 25000);
      });

      // Create the OpenAI API request promise
      const openaiPromise = openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Sen profesyonel bir rüya yorumcususun. Rüyaları psikolojik ve sembolik açıdan analiz ediyorsun."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800, // Reduced max tokens
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      // Race between timeout and the API request
      completion = await Promise.race([openaiPromise, timeout]) as any;

    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError);
      return res.status(500).json({
        success: false,
        error: 'OpenAI API hatası: ' + (openaiError.message || 'Bilinmeyen hata')
      });
    }

    const interpretation = completion.data.choices[0]?.message?.content;

    if (!interpretation) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API yanıt vermedi'
      });
    }

    // Save dream if user is authenticated (do this after sending the response)
    const authHeader = req.headers.authorization;
    const response = {
      success: true,
      interpretation
    };

    // Send the response first
    res.status(200).json(response);

    // Then save to database if needed
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (!authError && user) {
          await supabase
            .from('dreams')
            .insert([
              {
                user_id: user.id,
                dream_text: dream,
                interpretation: interpretation,
              }
            ]);
        }
      } catch (dbError) {
        console.error('Database operation error:', dbError);
      }
    }

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: 'Beklenmeyen bir hata oluştu'
    });
  }
}
