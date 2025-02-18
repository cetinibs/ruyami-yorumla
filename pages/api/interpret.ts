import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiModel } from '../../config/gemini';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      details: 'Only POST method is allowed'
    });
    return;
  }

  try {
    const { dream } = req.body;
    console.log('Dream text received:', {
      dream,
      type: typeof dream,
      length: dream?.length
    });

    if (!dream || typeof dream !== 'string' || dream.length < 3) {
      console.log('Invalid dream text:', { dream, type: typeof dream, length: dream?.length });
      res.status(400).json({
        success: false,
        error: 'Geçersiz rüya metni',
        details: 'Lütfen en az 3 karakter içeren bir rüya metni girin'
      });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is missing');
      res.status(500).json({
        success: false,
        error: 'Sunucu yapılandırma hatası',
        details: 'API anahtarı eksik veya geçersiz'
      });
      return;
    }

    console.log('Getting Gemini model...');
    const model = getGeminiModel();
    
    const maxRetries = 3;
    let retryCount = 0;
    let lastError = null;
    
    while (retryCount < maxRetries) {
      try {
        const parts = [
          { text: 'Sen bir rüya yorumcususun. Aşağıdaki rüyayı analiz et ve şu formatta yanıt ver:\n\n' },
          { text: '**GENEL ANLAMI:**\n[Rüyanın ana mesajı ve genel yorumu]\n\n' },
          { text: '**SEMBOLLER VE ANLAMLARI:**\n- [Sembol 1]: [Anlamı]\n- [Sembol 2]: [Anlamı]\n\n' },
          { text: '**PSİKOLOJİK YORUM:**\n[Psikolojik analiz]\n\n' },
          { text: '**ÖNERİLER:**\n- [Öneri 1]\n- [Öneri 2]\n\n' },
          { text: `Rüya: ${dream}` }
        ];

        console.log('Generating content...');
        const result = await model.generateContent(parts);
        console.log('Gemini API response received');
        
        if (!result.response) {
          throw new Error('No response from Gemini API');
        }

        const response = result.response;
        const interpretation = response.text();
        
        if (!interpretation) {
          throw new Error('Empty response from Gemini API');
        }

        console.log('Interpretation received:', {
          type: typeof interpretation,
          length: interpretation?.length
        });

        res.status(200).json({
          success: true,
          interpretation
        });
        return;

      } catch (aiError: any) {
        console.error(`Gemini API error on attempt ${retryCount + 1}:`, {
          error: aiError,
          message: aiError?.message,
          stack: aiError?.stack
        });
        
        lastError = aiError;
        retryCount++;
        
        if (retryCount >= maxRetries) {
          res.status(500).json({
            success: false,
            error: 'AI modeli hatası',
            details: 'Birkaç denemeye rağmen AI modelinden yanıt alınamadı. Lütfen daha sonra tekrar deneyin.'
          });
          return;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
  } catch (error: any) {
    console.error('Error in dream interpretation:', {
      error,
      message: error?.message,
      stack: error?.stack
    });
    
    res.status(500).json({
      success: false,
      error: 'Sunucu hatası',
      details: error?.message || 'Beklenmeyen bir hata oluştu'
    });
  }
}
