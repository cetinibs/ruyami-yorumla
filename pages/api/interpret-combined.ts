import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create supabase client only if environment variables are available
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Initialize Gemini API only if API key is available
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
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

  console.log('Combined API request received:', {
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
    // Check if API keys are available
    console.log('Checking API keys...');
    console.log('DEEPSEEK_API_KEY available:', !!DEEPSEEK_API_KEY);
    console.log('Gemini API available:', !!genAI);
    
    if (!DEEPSEEK_API_KEY || !genAI) {
      console.error('API keys missing:', {
        deepseekAvailable: !!DEEPSEEK_API_KEY,
        geminiAvailable: !!genAI
      });
      return res.status(503).json({
        error: 'Rüya yorumlama servisi şu anda kullanılamıyor'
      });
    }

    // Validate request body
    if (!req.body) {
      console.error('Request body is missing');
      return res.status(400).json({
        error: 'Request body is required'
      });
    }

    const { dream } = req.body;
    console.log('Dream text received:', dream ? dream.substring(0, 50) + '...' : 'undefined');

    if (!dream || typeof dream !== 'string') {
      console.error('Dream text is missing or not a string');
      return res.status(400).json({
        error: 'Dream text is required'
      });
    }

    if (dream.length > 1000) {
      console.error('Dream text is too long:', dream.length);
      return res.status(400).json({
        error: 'Dream text is too long (max 1000 characters)'
      });
    }

    try {
      // Create prompt for both APIs
      const prompt = `Aşağıdaki rüyayı Türkçe olarak detaylı bir şekilde yorumla. 
      Rüya içeriği: "${dream.trim()}"
      
      Lütfen yorumunu şu başlıklar altında yap:
      1. Genel Yorum
      2. Psikolojik Analiz
      3. Semboller ve Anlamları
      4. Öneriler`;

      console.log('Calling DeepSeek API...');
      let deepseekInterpretation = '';
      let sanitizedDeepseekInterpretation = '';
      
      try {
        // Call DeepSeek API
        console.log('DeepSeek API request:', {
          url: DEEPSEEK_API_URL,
          model: DEEPSEEK_MODEL_NAME,
          messageCount: 2,
          hasApiKey: !!DEEPSEEK_API_KEY
        });
        
        const deepseekResponse = await axios.post(
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
            },
            timeout: 30000 // 30 seconds timeout
          }
        );

        console.log('DeepSeek API response received:', {
          status: deepseekResponse.status,
          statusText: deepseekResponse.statusText,
          hasData: !!deepseekResponse.data,
          hasChoices: !!(deepseekResponse.data && deepseekResponse.data.choices)
        });
        
        // Extract DeepSeek interpretation
        if (deepseekResponse.data && 
            deepseekResponse.data.choices && 
            deepseekResponse.data.choices.length > 0 &&
            deepseekResponse.data.choices[0].message) {
          deepseekInterpretation = deepseekResponse.data.choices[0].message.content;
          sanitizedDeepseekInterpretation = sanitizeInterpretation(deepseekInterpretation);
          console.log('DeepSeek interpretation (first 100 chars):', sanitizedDeepseekInterpretation.substring(0, 100) + '...');
        } else {
          console.error('Invalid DeepSeek API response format:', deepseekResponse.data);
          throw new Error('DeepSeek API yanıtı geçersiz format içeriyor');
        }
      } catch (deepseekError) {
        console.error('DeepSeek API error:', deepseekError);
        if (deepseekError.response) {
          console.error('DeepSeek API error status:', deepseekError.response.status);
          console.error('DeepSeek API error data:', deepseekError.response.data);
        } else if (deepseekError.request) {
          console.error('DeepSeek API no response received:', deepseekError.request);
        } else {
          console.error('DeepSeek API error message:', deepseekError.message);
        }
        // Continue with Gemini even if DeepSeek fails
        deepseekInterpretation = "DeepSeek API'den yanıt alınamadı. Lütfen daha sonra tekrar deneyin.";
        sanitizedDeepseekInterpretation = deepseekInterpretation;
      }

      console.log('Calling Gemini API...');
      let geminiInterpretation = '';
      let sanitizedGeminiInterpretation = '';
      
      try {
        // Call Gemini API
        console.log('Gemini API request with model: gemini-1.5-pro');
        
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const result = await model.generateContent(prompt);
        
        console.log('Gemini API response received:', {
          hasResult: !!result,
          hasResponse: !!(result && result.response)
        });
        
        if (result && result.response) {
          const response = await result.response;
          geminiInterpretation = response.text();
          sanitizedGeminiInterpretation = sanitizeInterpretation(geminiInterpretation);
          console.log('Gemini interpretation (first 100 chars):', sanitizedGeminiInterpretation.substring(0, 100) + '...');
        } else {
          console.error('Invalid Gemini API response format:', result);
          throw new Error('Gemini API yanıtı geçersiz format içeriyor');
        }
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError);
        if (geminiError.message) {
          console.error('Gemini API error message:', geminiError.message);
        }
        if (geminiError.stack) {
          console.error('Gemini API error stack:', geminiError.stack);
        }
        // Continue with DeepSeek even if Gemini fails
        geminiInterpretation = "Gemini API'den yanıt alınamadı. Lütfen daha sonra tekrar deneyin.";
        sanitizedGeminiInterpretation = geminiInterpretation;
      }

      // Combine interpretations
      const combinedInterpretation = `## DeepSeek Yorumu:\n\n${sanitizedDeepseekInterpretation}\n\n## Gemini Yorumu:\n\n${sanitizedGeminiInterpretation}`;
      console.log('Combined interpretation created');

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
                  interpretation: combinedInterpretation,
                  ai_model: 'combined'
                }
              ]);
            console.log('Dream saved to database');
          }
        } catch (error) {
          console.error('Database error:', error);
          // Continue even if database save fails
        }
      }

      // Always return a valid JSON response
      console.log('Returning successful response');
      return res.status(200).json({
        interpretation: combinedInterpretation
      });

    } catch (apiError: any) {
      console.error('API error:', apiError);
      console.error('API error stack:', apiError.stack);
      return res.status(503).json({
        error: 'Rüya yorumlama servisi şu anda meşgul. Lütfen birkaç dakika sonra tekrar deneyin.'
      });
    }

  } catch (error: any) {
    console.error('API error:', error);
    console.error('API error stack:', error.stack);
    
    // Ensure we always return a valid JSON response
    return res.status(500).json({
      error: 'An error occurred while processing your request'
    });
  }
}
