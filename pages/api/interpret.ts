import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiModel } from '../../config/gemini';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('API request received:', { method: req.method, body: req.body });

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dream } = req.body;
    console.log('Dream text received:', dream);

    if (!dream || typeof dream !== 'string' || dream.length < 3) {
      console.log('Invalid dream text:', { dream, type: typeof dream, length: dream?.length });
      return res.status(400).json({
        error: 'Geçersiz rüya metni',
        details: 'Lütfen en az 3 karakter içeren bir rüya metni girin'
      });
    }

    console.log('Getting Gemini model...');
    const model = getGeminiModel();
    
    const prompt = `Sen deneyimli bir rüya yorumcususun. Rüyaları psikolojik, spiritüel ve sembolik açıdan detaylı olarak analiz ediyorsun.
Şimdi sana vereceğim rüyayı çok detaylı bir şekilde yorumla. Her bölümde en az 3-4 cümle kullan ve derinlemesine analiz yap.
Yanıtını tam olarak aşağıdaki formatta ver:

**1. GENEL ANLAMI:**
[Rüyanın genel anlamını, ana mesajını ve rüya sahibine vermek istediği mesajı detaylı olarak açıkla. Rüyanın genel atmosferini ve duygusal tonunu da belirt. En az 4-5 cümle kullan.]

**2. SEMBOLLER VE ANLAMLARI:**
- [Sembol 1]: [Bu sembolün genel anlamını, kültürel ve psikolojik yorumunu, ve rüyadaki özel bağlamını detaylıca açıkla]
- [Sembol 2]: [Her sembol için en az 2-3 cümlelik detaylı açıklama ver]
- [Sembol 3]: [Sembollerin birbiriyle olan ilişkisini de açıkla]

**3. PSİKOLOJİK YORUM:**
[Rüyanın psikolojik boyutunu derinlemesine analiz et. Bilinçaltı mesajları, bastırılmış duygular, korkular veya arzuları açıkla. Jung ve Freud gibi psikologların teorilerine de değin. En az 4-5 cümle kullan.]

**4. HAYATINIZA YANSIMALARI:**
- [Yansıma 1]: [Her yansımayı en az 2-3 cümle ile detaylı açıkla]
- [Yansıma 2]: [Rüyanın gerçek hayattaki olası yansımalarını ve etkilerini detaylandır]
- [Yansıma 3]: [Kişisel gelişim ve kendini tanıma açısından öneriler ver]

**5. DİKKAT EDİLMESİ GEREKENLER:**
- [Öneri 1]: [Her öneriyi detaylı açıkla ve pratik tavsiyeler ver]
- [Öneri 2]: [Rüyanın uyarı niteliğindeki mesajlarını detaylandır]
- [Öneri 3]: [Gelecekte dikkat edilmesi gereken noktaları belirt]

Rüya: ${dream}`;

    console.log('Calling Gemini API...');
    const result = await model.generateContent(prompt);
    console.log('Gemini API response received');
    const response = await result.response;
    const interpretation = response.text();
    
    // Validate that we got a proper response
    if (!interpretation || typeof interpretation !== 'string') {
      console.error('Invalid response from Gemini:', interpretation);
      return res.status(500).json({
        error: 'Geçersiz API yanıtı',
        details: 'AI modelinden geçerli bir yanıt alınamadı'
      });
    }
    
    console.log('Interpretation generated:', interpretation.substring(0, 100) + '...');

    // Ensure we're returning valid JSON
    try {
      return res.status(200).json({ 
        success: true,
        interpretation 
      });
    } catch (jsonError) {
      console.error('Error stringifying response:', jsonError);
      return res.status(500).json({
        error: 'Yanıt işlenirken hata oluştu',
        details: 'Yanıt JSON formatına dönüştürülemedi'
      });
    }
  } catch (error) {
    console.error('Error in dream interpretation:', error);
    return res.status(500).json({
      error: 'Rüya yorumlanırken bir hata oluştu',
      details: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu'
    });
  }
}
