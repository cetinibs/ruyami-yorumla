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
    bodyParser: {
      sizeLimit: '1mb'
    },
    responseLimit: false,
  },
};

// Function to sanitize and truncate interpretation
const sanitizeInterpretation = (text: string, maxLength: number = 2000): string => {
  if (!text) return '';
  
  // Remove any non-printable characters
  let sanitized = text.replace(/[^\x20-\x7E\xA0-\xFF\u0100-\u017F\u0180-\u024F\u0300-\u036F\u1E00-\u1EFF]/g, '');
  
  // Replace multiple spaces with single space
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Truncate if too long
  if (sanitized.length > maxLength) {
    const truncated = sanitized.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    if (lastPeriod > maxLength * 0.8) {
      return truncated.substring(0, lastPeriod + 1);
    }
    return truncated + '...';
  }
  
  return sanitized.trim();
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  console.log('API request received:', {
    method: req.method,
    headers: req.headers,
    body: req.body
  });

  // Set CORS headers first
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
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
    return;
  }

  try {
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      console.log('Invalid request body:', req.body);
      res.status(400).json({
        success: false,
        error: 'Invalid request body'
      });
      return;
    }

    const { dream } = req.body;

    if (!dream || typeof dream !== 'string' || dream.trim().length === 0) {
      console.log('Invalid dream text:', dream);
      res.status(400).json({
        success: false,
        error: 'Dream text is required'
      });
      return;
    }

    if (dream.trim().length > 1000) {
      console.log('Dream text too long:', dream.length);
      res.status(400).json({
        success: false,
        error: 'Dream text is too long (max 1000 characters)'
      });
      return;
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
      res.status(503).json({
        success: false,
        error: 'Rüya yorumlama servisi şu anda meşgul. Lütfen birkaç dakika sonra tekrar deneyin.'
      });
      return;
    }

    const interpretation = completion.data.choices[0]?.message?.content;

    if (!interpretation) {
      console.log('No interpretation received from OpenAI');
      res.status(500).json({
        success: false,
        error: 'Rüya yorumu alınamadı. Lütfen tekrar deneyin.'
      });
      return;
    }

    // Sanitize and truncate interpretation
    const sanitizedInterpretation = sanitizeInterpretation(interpretation);

    // Prepare the response
    const response = {
      success: true,
      interpretation: sanitizedInterpretation
    };

    console.log('Sending response:', response);

    // Send the response
    res.status(200).json(response);

    // Then try to save to database if user is authenticated
    const authHeader = req.headers.authorization;
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
                dream_text: dream.trim(),
                interpretation: sanitizedInterpretation,
              }
            ]);
        }
      } catch (dbError) {
        console.error('Database operation error:', dbError);
      }
    }

  } catch (error: any) {
    console.error('Unexpected error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
      });
    }
  }
}
