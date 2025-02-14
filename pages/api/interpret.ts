import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectDB from '../../config/mongodb';
import DreamQuery from '../../models/DreamQuery';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Opsiyonel auth middleware
const getUser = (req: NextApiRequest): Promise<string | null> => {
  return new Promise((resolve) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      resolve(null);
      return;
    }

    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        resolve(null);
        return;
      }
      resolve(decoded.userId);
    });
  });
};

type Data = {
  interpretation: string;
};

type ErrorResponse = {
  error: string;
  details?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dream } = req.body;

    if (!dream || dream.length > 500) {
      return res.status(400).json({ error: 'Invalid dream text' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('Gemini API key is not configured');
      return res.status(500).json({ 
        error: 'API configuration error',
        details: 'Gemini API key is not properly configured'
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Sen deneyimli bir rüya yorumcususun. Rüyaları psikolojik, spiritüel ve sembolik açıdan detaylı olarak analiz ediyorsun. 
Şimdi sana vereceğim rüyayı çok detaylı bir şekilde yorumla. Her bölümde en az 3-4 cümle kullan ve derinlemesine analiz yap.
Yanıtını tam olarak aşağıdaki formatta ver:

**1. GENEL ANLAMI:**
[Rüyanın genel anlamını, ana mesajını ve rüya sahibine vermek istediği mesajı detaylı olarak açıkla. Rüyanın genel atmosferini ve duygusal tonunu da belirt. En az 4-5 cümle kullan.]

**2. SEMBOLLER VE ANLAMLARI:**
- [Sembol 1]: [Bu sembolün genel anlamını, kültürel ve psikolojik yorumunu, ve rüyadaki özel bağlamını detaylıca açıkla]
- [Sembol 2]: [Her sembol için en az 2-3 cümlelik detaylı açıklama ver]
- [Sembol 3]: [Sembollerin birbiriyle olan ilişkisini de açıkla]
- [Sembol 4]: [Varsa diğer önemli sembolleri de ekle ve detaylandır]

**3. PSİKOLOJİK YORUM:**
[Rüyanın psikolojik boyutunu derinlemesine analiz et. Bilinçaltı mesajları, bastırılmış duygular, korkular veya arzuları açıkla. Jung ve Freud gibi psikologların teorilerine de değin. Rüya sahibinin iç dünyasını anlamaya çalış. En az 5-6 cümle kullan.]

**4. HAYATINIZA YANSIMALARI:**
- [Yansıma 1]: [Her yansımayı en az 2-3 cümle ile detaylı açıkla]
- [Yansıma 2]: [Rüyanın gerçek hayattaki olası yansımalarını ve etkilerini detaylandır]
- [Yansıma 3]: [Kişisel gelişim ve kendini tanıma açısından öneriler ver]
- [Yansıma 4]: [Varsa kariyer, ilişkiler veya diğer yaşam alanlarına etkileri açıkla]

**5. DİKKAT EDİLMESİ GEREKENLER:**
- [Öneri 1]: [Her öneriyi detaylı açıkla ve pratik tavsiyeler ver]
- [Öneri 2]: [Rüyanın uyarı niteliğindeki mesajlarını detaylandır]
- [Öneri 3]: [Gelecekte dikkat edilmesi gereken noktaları belirt]
- [Öneri 4]: [Kişisel gelişim için yapılabilecek çalışmaları öner]

Rüya: ${dream}

Not: 
1. Her bölümü detaylı ve kapsamlı bir şekilde ele al
2. Yüzeysel ve kısa cevaplardan kaçın
3. Her maddeyi birkaç cümle ile açıkla
4. Formatı kesinlikle bozma
5. Her bölüm "**" ile başlamalı
6. Liste öğeleri "-" ile başlamalı`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const interpretation = response.text();

    // Kullanıcı kontrolü
    const userId = await getUser(req);
    
    // Eğer kullanıcı giriş yapmışsa yorumu kaydet
    if (userId) {
      await connectDB();
      await DreamQuery.create({
        userId,
        dreamText: dream,
        interpretation,
      });
    }

    res.status(200).json({ interpretation });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Rüya yorumlanırken bir hata oluştu', details: error.message });
  }
}
