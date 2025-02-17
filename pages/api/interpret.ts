import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiModel } from '../../config/gemini';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Log incoming request
  console.log('API request received:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
    url: req.url
  });

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  
  // Set content type to JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
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
      return res.status(400).json({
        error: 'Geçersiz rüya metni',
        details: 'Lütfen en az 3 karakter içeren bir rüya metni girin',
        received: {
          dream,
          type: typeof dream,
          length: dream?.length
        }
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is missing');
      return res.status(500).json({
        error: 'Sunucu yapılandırma hatası',
        details: 'API anahtarı eksik veya geçersiz'
      });
    }

    console.log('Getting Gemini model...');
    const model = getGeminiModel();
    
    while (retryCount < maxRetries) {
      try {
        // Prompt'u parçalara ayırarak gönderelim
        const parts = [
          { text: 'Sen bir rüya yorumcususun. Aşağıdaki rüyayı analiz et ve şu formatta yanıt ver:\n\n' },
          { text: '**GENEL ANLAMI:**\n[Rüyanın ana mesajı ve genel yorumu]\n\n' },
          { text: '**SEMBOLLER VE ANLAMLARI:**\n- [Sembol 1]: [Anlamı]\n- [Sembol 2]: [Anlamı]\n\n' },
          { text: '**PSİKOLOJİK YORUM:**\n[Psikolojik analiz]\n\n' },
          { text: '**ÖNERİLER:**\n- [Öneri 1]\n- [Öneri 2]\n\n' },
          { text: `Rüya: ${dream}` }
        ];

        console.log('Generating content with parts...');
        const result = await model.generateContent(parts);
        console.log('Gemini API response received');
        
        if (!result.response) {
          throw new Error('No response from Gemini API');
        }

        const response = result.response;
        console.log('Gemini response object:', {
          type: typeof response,
          hasText: typeof response.text === 'function'
        });
        
        const interpretation = response.text();
        console.log('Interpretation received:', {
          type: typeof interpretation,
          length: interpretation?.length,
          preview: interpretation?.substring(0, 100)
        });

        if (!interpretation) {
          throw new Error('Empty response from Gemini');
        }

        // Yanıtı doğrula
        if (!interpretation.includes('GENEL ANLAMI') || 
            !interpretation.includes('SEMBOLLER VE ANLAMLARI') || 
            !interpretation.includes('PSİKOLOJİK YORUM') || 
            !interpretation.includes('ÖNERİLER')) {
          throw new Error('Invalid response format from Gemini');
        }

        const jsonResponse = {
          success: true,
          interpretation
        };

        console.log('Sending successful response');
        return res.status(200).json(jsonResponse);
        
      } catch (retryError: any) {
        lastError = retryError;
        retryCount++;
        
        console.error('API call attempt failed:', {
          attempt: retryCount,
          error: retryError?.message,
          dream: dream.substring(0, 100)
        });
        
        if (retryCount < maxRetries) {
          console.log(`Retry attempt ${retryCount} of ${maxRetries}...`);
          // Exponential backoff: 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount - 1) * 1000));
        }
      }
    }

    // Tüm denemeler başarısız olduysa
    console.error('All retry attempts failed:', {
      error: lastError,
      message: lastError?.message,
      retryCount
    });
    
    return res.status(500).json({
      error: 'AI modeli hatası',
      details: 'Birkaç denemeye rağmen AI modelinden yanıt alınamadı. Lütfen daha sonra tekrar deneyin.'
    });

  } catch (aiError: any) {
    console.error('Gemini API error:', {
      error: aiError,
      message: aiError?.message,
      stack: aiError?.stack
    });
    return res.status(500).json({
      error: 'AI modeli hatası',
      details: aiError?.message || 'Rüya yorumlanırken bir hata oluştu'
    });
  }
} catch (error: any) {
  console.error('Error in dream interpretation:', {
    error,
    message: error?.message,
    stack: error?.stack
  });
  return res.status(500).json({
    error: 'Sunucu hatası',
    details: error?.message || 'Beklenmeyen bir hata oluştu'
  });
}
