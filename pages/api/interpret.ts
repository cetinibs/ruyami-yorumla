import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

// Initialize OpenAI client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key');
}

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
    bodyParser: {
      sizeLimit: '1mb'
    },
    responseLimit: false,
  },
};

// Helper function to sanitize interpretation text
function sanitizeInterpretation(text: string): string {
  return text
    .replace(/[^\w\s.,!?-]/g, '') // Remove special characters except basic punctuation
    .replace(/\s+/g, ' ')         // Replace multiple spaces with single space
    .trim();                      // Remove leading/trailing whitespace
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  console.log('API request received:', {
    method: req.method,
    headers: req.headers,
    body: req.body
  });

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      console.log('Invalid request body:', req.body);
      return res.status(400).json({
        success: false,
        error: 'Invalid request body'
      });
    }

    const { dream } = req.body;

    if (!dream || typeof dream !== 'string' || dream.trim().length === 0) {
      console.log('Invalid dream text:', dream);
      return res.status(400).json({
        success: false,
        error: 'Dream text is required'
      });
    }

    if (dream.trim().length > 1000) {
      console.log('Dream text too long:', dream.length);
      return res.status(400).json({
        success: false,
        error: 'Dream text is too long (max 1000 characters)'
      });
    }

    // Create prompt
    const prompt = `Aşağıdaki rüyayı Türkçe olarak detaylı bir şekilde yorumla. 
    Rüya içeriği: "${dream.trim()}"
    
    Lütfen yorumunu şu başlıklar altında yap:
    1. Genel Yorum
    2. Psikolojik Analiz
    3. Semboller ve Anlamları
    4. Öneriler`;

    // Make OpenAI API request
    let completion;
    try {
      // Create a promise that rejects in 20 seconds
      const timeout = new Promise((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error('OpenAI API zaman aşımına uğradı'));
        }, 20000);
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
        max_tokens: 500,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      // Race between timeout and the API request
      completion = await Promise.race([openaiPromise, timeout]) as any;

    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError);
      return res.status(503).json({
        success: false,
        error: 'Rüya yorumlama servisi şu anda meşgul. Lütfen birkaç dakika sonra tekrar deneyin.'
      });
    }

    // Validate OpenAI response
    if (!completion.data?.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response:', completion.data);
      return res.status(500).json({
        success: false,
        error: 'Invalid response from OpenAI'
      });
    }

    const interpretation = completion.data.choices[0].message.content.trim();

    // Sanitize interpretation
    const sanitizedInterpretation = sanitizeInterpretation(interpretation);

    // Save to database if user is authenticated
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          await supabase
            .from('dreams')
            .insert([
              {
                user_id: user.id,
                dream_text: dream.trim(),
                interpretation: sanitizedInterpretation,
              }
            ]);
        }
      } catch (error) {
        console.error('Database error:', error);
        // Continue even if database save fails
      }
    }

    // Always return a valid JSON response
    return res.status(200).json({
      success: true,
      interpretation: sanitizedInterpretation
    });

  } catch (error: any) {
    console.error('API error:', error);
    
    // Ensure we always return a valid JSON response
    return res.status(500).json({
      success: false,
      error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
    });
  }
}
