import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiModel } from '../../config/gemini';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    if (!dream || typeof dream !== 'string' || dream.length < 3) {
      return res.status(400).json({
        error: 'Geçersiz rüya metni',
        details: 'Lütfen en az 3 karakter içeren bir rüya metni girin'
      });
    }

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const interpretation = response.text();

    return res.status(200).json({ interpretation });
  } catch (error) {
    console.error('Error in dream interpretation:', error);
    return res.status(500).json({
      error: 'Rüya yorumlanırken bir hata oluştu',
      details: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu'
    });
  }
}
