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

// AIML API configuration
const AIML_API_KEY = process.env.AIML_API_KEY || 'aa93527f72624e9aa8a803d6dc9f7fbb';
const AIML_API_URL = 'https://api.aimlapi.com/chat/completions';

console.log('AIML API initialized with:', {
  apiKeyAvailable: !!AIML_API_KEY,
  apiKeyFirstChars: AIML_API_KEY ? AIML_API_KEY.substring(0, 5) + '...' : 'none',
  baseURL: AIML_API_URL
});

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

  console.log('AIML API request received:', {
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
    // Check if API key is available
    console.log('Checking AIML API key...');
    console.log('AIML_API_KEY available:', !!AIML_API_KEY);
    
    if (!AIML_API_KEY) {
      console.error('AIML API key missing');
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
      // Create prompt for AIML API
      const systemPrompt = 'Sen bir rüya yorumlama uzmanısın. Kullanıcıların rüyalarını psikolojik ve sembolik açıdan analiz ederek detaylı yorumlar yaparsın.';
      const userPrompt = `Aşağıdaki rüyayı Türkçe olarak detaylı bir şekilde yorumla. 
      Rüya içeriği: "${dream.trim()}"
      
      Lütfen yorumunu şu başlıklar altında yap:
      1. Genel Yorum
      2. Psikolojik Analiz
      3. Semboller ve Anlamları
      4. Öneriler`;

      console.log('Calling AIML API...');
      
      try {
        // Call AIML API using axios
        console.log('AIML API request:', {
          url: AIML_API_URL,
          hasApiKey: !!AIML_API_KEY,
          apiKeyFirstChars: AIML_API_KEY ? AIML_API_KEY.substring(0, 5) + '...' : 'none'
        });
        
        const response = await axios.post(
          AIML_API_URL,
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${AIML_API_KEY}`
            }
          }
        );

        console.log('AIML API response received:', {
          status: response.status,
          hasData: !!response.data,
          hasChoices: !!(response.data && response.data.choices),
          choicesLength: response.data?.choices?.length
        });
        
        if (response.data && 
            response.data.choices && 
            response.data.choices.length > 0 &&
            response.data.choices[0].message) {
          const interpretation = response.data.choices[0].message.content;
          const sanitizedInterpretation = sanitizeInterpretation(interpretation);
          console.log('AIML interpretation (first 100 chars):', sanitizedInterpretation.substring(0, 100) + '...');

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
                      ai_model: 'aiml'
                    }
                  ]);
                console.log('Dream saved to database');
              }
            } catch (error) {
              console.error('Database error:', error);
              // Continue even if database save fails
            }
          }

          // Return the interpretation
          console.log('Returning successful response');
          return res.status(200).json({
            interpretation: sanitizedInterpretation
          });
        } else {
          console.error('Invalid AIML API response format:', response.data);
          throw new Error('AIML API yanıtı geçersiz format içeriyor');
        }
      } catch (aimlError) {
        console.error('AIML API error:', aimlError);
        if (aimlError.response) {
          console.error('AIML API error status:', aimlError.response.status);
          console.error('AIML API error data:', aimlError.response.data);
        } else if (aimlError.request) {
          console.error('AIML API no response received:', aimlError.request);
        } else {
          console.error('AIML API error message:', aimlError.message);
        }
        throw aimlError;
      }
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
