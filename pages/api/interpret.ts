import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header missing'
      });
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '');

    // Verify the session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    const { dream } = req.body;

    if (!dream) {
      return res.status(400).json({
        success: false,
        error: 'Dream text is required'
      });
    }

    // OpenAI API isteği
    const prompt = `Aşağıdaki rüyayı Türkçe olarak detaylı bir şekilde yorumla. 
    Rüya içeriği: "${dream}"
    
    Lütfen yorumunu şu başlıklar altında yap:
    1. Genel Yorum
    2. Psikolojik Analiz
    3. Semboller ve Anlamları
    4. Öneriler`;

    const completion = await openai.createChatCompletion({
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
      max_tokens: 1000,
    });

    const interpretation = completion.data.choices[0]?.message?.content;

    if (!interpretation) {
      throw new Error('OpenAI API yanıt vermedi');
    }

    // Save to database
    const { error: dbError } = await supabase
      .from('dreams')
      .insert([
        {
          user_id: user.id,
          dream_text: dream,
          interpretation: interpretation,
        }
      ]);

    if (dbError) {
      console.error('Database error:', dbError);
      // Veritabanı hatası olsa bile yorumu döndür
    }

    return res.status(200).json({
      success: true,
      interpretation
    });

  } catch (error: any) {
    console.error('Interpretation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during interpretation'
    });
  }
}
