import { NlpManager } from 'node-nlp';

class DreamInterpreter {
  private manager: NlpManager;
  private readonly dreamSymbols: { [key: string]: string } = {
    'ev': 'Ev genellikle kendinizi, iç dünyanızı ve güvenli alanınızı temsil eder.',
    'uçmak': 'Uçmak özgürlük, başarı ve engelleri aşma arzusunu temsil eder.',
    'düşmek': 'Düşmek kontrol kaybı veya hayatınızdaki belirsizlikleri gösterir.',
    'su': 'Su duygusal durumunuzu ve bilinçaltınızı temsil eder.',
    'araba': 'Araba hayattaki ilerlemenizi ve yönünüzü temsil eder.',
    'çocuk': 'Çocuk yeni başlangıçları ve içinizdeki masumiyeti temsil eder.',
    'ağaç': 'Ağaç büyüme, gelişme ve hayat döngüsünü temsil eder.',
    'yılan': 'Yılan değişim, dönüşüm ve bilgeliği temsil eder.',
    'köpek': 'Köpek sadakat, dostluk ve korumayı temsil eder.',
    'kedi': 'Kedi bağımsızlık, gizem ve sezgileri temsil eder.',
    // Daha fazla sembol eklenebilir
  };

  constructor() {
    this.manager = new NlpManager({ languages: ['tr'] });
    this.initializeManager();
  }

  private async initializeManager() {
    // Temel kalıpları ve yanıtları ekle
    Object.entries(this.dreamSymbols).forEach(([symbol, meaning]) => {
      this.manager.addDocument('tr', `${symbol}`, `symbol.${symbol}`);
      this.manager.addAnswer('tr', `symbol.${symbol}`, meaning);
    });

    await this.manager.train();
  }

  public async interpretDream(dreamText: string): Promise<string> {
    try {
      let interpretation = 'Rüyanızın yorumu:\n\n';
      
      // Rüya metnindeki sembolleri analiz et
      const words = dreamText.toLowerCase().split(/\s+/);
      const foundSymbols = new Set<string>();
      
      for (const word of words) {
        if (this.dreamSymbols[word]) {
          foundSymbols.add(word);
        }
      }

      if (foundSymbols.size === 0) {
        return 'Bu rüyada belirgin semboller bulamadım, ancak her rüya kişisel deneyimleriniz ve duygularınızla ilişkilidir. ' +
               'Rüyanızı gördüğünüz dönemdeki duygularınızı ve yaşadıklarınızı düşünerek anlamlandırabilirsiniz.';
      }

      // Bulunan sembollerin yorumlarını ekle
      for (const symbol of foundSymbols) {
        interpretation += `"${symbol}": ${this.dreamSymbols[symbol]}\n\n`;
      }

      interpretation += '\nGenel Yorum: ';
      interpretation += 'Bu semboller bir araya geldiğinde, rüyanız muhtemelen ' +
                       'iç dünyanızdaki değişimleri ve duygusal süreçleri yansıtıyor. ' +
                       'Rüyanızı kendi yaşam deneyimleriniz bağlamında değerlendirmenizi öneririm.';

      return interpretation;
    } catch (error) {
      console.error('Interpretation error:', error);
      return 'Üzgünüm, rüyanızı yorumlarken bir hata oluştu.';
    }
  }
}

export default DreamInterpreter;
