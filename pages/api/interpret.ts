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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('API called with method:', req.method);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).json({ success: true });
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    console.log('Request body:', req.body);
    const { dream } = req.body;

    if (!dream || typeof dream !== 'string' || dream.trim().length === 0) {
      console.log('Invalid dream text:', { dream, type: typeof dream });
      return res.status(400).json({
        success: false,
        error: 'Dream text is required'
      });
    }

    // OpenAI API isteği
    console.log('Sending request to OpenAI...');
    const prompt = `Aşağıdaki rüyayı Türkçe olarak detaylı bir şekilde yorumla. 
    Rüya içeriği: "${dream.trim()}"
    
    Lütfen yorumunu şu başlıklar altında yap:
    1. Genel Yorum
    2. Psikolojik Analiz
    3. Semboller ve Anlamları
    4. Öneriler`;

    try {
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

      console.log('OpenAI response received');
      const interpretation = completion.data.choices[0]?.message?.content;

      if (!interpretation) {
        console.error('No interpretation received from OpenAI');
        throw new Error('OpenAI API yanıt vermedi');
      }

      // Eğer kullanıcı giriş yapmışsa rüyayı kaydet
      const authHeader = req.headers.authorization;
      if (authHeader) {
        console.log('Auth header found, saving dream...');
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (!authError && user) {
          console.log('Saving dream for user:', user.id);
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
          }
        }
      }

      console.log('Sending successful response');
      return res.status(200).json({
        success: true,
        interpretation
      });

    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError);
      return res.status(500).json({
        success: false,
        error: 'OpenAI API hatası: ' + (openaiError.message || 'Bilinmeyen hata')
      });
    }

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    });
  }
}
