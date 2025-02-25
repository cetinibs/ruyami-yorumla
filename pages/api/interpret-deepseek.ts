import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create supabase client only if environment variables are available
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// DeepSeek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL_NAME = 'deepseek-chat';

type ApiResponse = {
  interpretation?: string;
  error?: string;
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
  res: NextApiResponse<ApiResponse>
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('DeepSeek API request received:', {
    method: req.method,
    body: req.body
  });

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    // Check if DeepSeek API key is available
    if (!DEEPSEEK_API_KEY) {
      return res.status(503).json({
        error: 'Rüya yorumlama servisi şu anda kullanılamıyor'
      });
    }

    // Validate request body
    if (!req.body) {
      return res.status(400).json({
        error: 'Request body is required'
      });
    }

    const { dream } = req.body;

    if (!dream || typeof dream !== 'string') {
      return res.status(400).json({
        error: 'Dream text is required'
      });
    }

    if (dream.length > 1000) {
      return res.status(400).json({
        error: 'Dream text is too long (max 1000 characters)'
      });
    }

    try {
      // Create prompt for DeepSeek API
      const prompt = `Aşağıdaki rüyayı Türkçe olarak detaylı bir şekilde yorumla. 
      Rüya içeriği: "${dream.trim()}"
      
      Lütfen yorumunu şu başlıklar altında yap:
      1. Genel Yorum
      2. Psikolojik Analiz
      3. Semboller ve Anlamları
      4. Öneriler`;

      // Call DeepSeek API
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: DEEPSEEK_MODEL_NAME,
          messages: [
            {
              role: 'system',
              content: 'Sen bir rüya yorumlama uzmanısın. Kullanıcıların rüyalarını psikolojik ve sembolik açıdan analiz ederek detaylı yorumlar yaparsın.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
          }
        }
      );

      // Extract interpretation from response
      const interpretation = response.data.choices[0].message.content;

      // Sanitize interpretation
      const sanitizedInterpretation = sanitizeInterpretation(interpretation);

      // Save to database if user is authenticated and Supabase is available
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token && supabase) {
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
                  ai_model: DEEPSEEK_MODEL_NAME
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
        interpretation: sanitizedInterpretation
      });

    } catch (deepseekError: any) {
      console.error('DeepSeek API error:', deepseekError);
      return res.status(503).json({
        error: 'Rüya yorumlama servisi şu anda meşgul. Lütfen birkaç dakika sonra tekrar deneyin.'
      });
    }

  } catch (error: any) {
    console.error('API error:', error);
    
    // Ensure we always return a valid JSON response
    return res.status(500).json({
      error: 'An error occurred while processing your request'
    });
  }
}
