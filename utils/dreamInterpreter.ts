import { GoogleGenerativeAI } from '@google/generative-ai';

class DreamInterpreter {
  private gemini: any;
  private model: any;
  private dreamSymbols: { [key: string]: string };

  constructor(apiKey: string) {
    this.gemini = new GoogleGenerativeAI(apiKey);
    this.model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
    this.dreamSymbols = {
      'uçmak': 'Özgürlük, bağımsızlık ve başarı arzusunu temsil eder.',
      'düşmek': 'Kontrol kaybı, güvensizlik veya hayattaki değişimlerden duyulan endişeyi gösterir.',
      'ev': 'Kendinizi, iç dünyanızı ve güvenlik ihtiyacınızı temsil eder.',
      'su': 'Duygusal durumunuzu ve bilinçaltınızı simgeler.',
      'araba': 'Hayattaki yönünüzü ve ilerleme arzunuzu temsil eder.',
    };
  }

  private async analyzeWithAI(dreamText: string): Promise<string> {
    try {
      const prompt = `Aşağıdaki rüyayı analiz et ve yorumla. Cevabını markdown formatında, başlıklar ve maddeler halinde ver:

Rüya: ${dreamText}

Lütfen şu başlıkları kullan:
1. Genel Yorum
2. Semboller ve Anlamları
3. Psikolojik Analiz
4. Tavsiyeler

Her başlık altında en az 3 madde olsun. Cevabını ** işaretleri arasında ver, örnek:
**1. Genel Yorum**
- Madde 1
- Madde 2
- Madde 3

**2. Semboller ve Anlamları**
...`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI analiz hatası:', error);
      throw new Error('Rüya analizi sırasında bir hata oluştu.');
    }
  }

  public async interpretDream(dreamText: string): Promise<string> {
    try {
      // AI analizi
      const aiInterpretation = await this.analyzeWithAI(dreamText);

      // Rüyada geçen sembolleri bul
      const foundSymbols = Object.keys(this.dreamSymbols).filter(symbol => 
        dreamText.toLowerCase().includes(symbol.toLowerCase())
      );

      // Genel yorumu hazırla
      let interpretation = aiInterpretation + '\n\n';

      // Bulunan sembollerin yorumlarını ekle
      if (foundSymbols.length > 0) {
        interpretation += '\n**Rüyanızda Tespit Edilen Özel Semboller**\n';
        foundSymbols.forEach(symbol => {
          interpretation += `- "${symbol}": ${this.dreamSymbols[symbol]}\n`;
        });
      }

      return interpretation;
    } catch (error) {
      console.error('Yorumlama hatası:', error);
      throw new Error('Rüya yorumlanırken bir hata oluştu.');
    }
  }
}

export default DreamInterpreter;
