**Ürün Gereksinim Dokümanı (PRD)**

# **Rüya Yorumlama Web Uygulaması**

## **1. Genel Bakış**
Bu web uygulaması, kullanıcıların rüyalarını metin olarak girmesine ve yapay zeka (AI) tabanlı bir yorumlama sisteminden analiz almasına olanak tanır. Kullanıcılar, maksimum 500 karakterlik bir metin alanına rüyalarını yazıp "Yorumla" butonuna basarak AI destekli bir yanıt alırlar. AI entegrasyonu için ücretsiz API anahtarları kullanılacaktır.

## **2. Hedef Kitle**
- Rüyalarını anlamlandırmak isteyen bireyler
- Maneviyat ve psikolojiyle ilgilenen kullanıcılar
- AI tabanlı hizmetleri deneyimlemek isteyen meraklılar

## **3. Ana Özellikler**

### **3.1. Kullanıcı Arayüzü (UI)**
- **Ana Sayfa:**
  - Rüya metni girişi için bir **text input** alanı (maksimum 500 karakter).
  - "**Yorumla**" butonu.
  - AI tarafından üretilen yorumların görüntülendiği bir çıktı alanı.
  - Kullanıcıya AI’nin ücretsiz bir API üzerinden yorum yaptığı bilgisi.

- **Sonuç Sayfası:**
  - Kullanıcının girdiği rüya metni.
  - AI tarafından oluşturulan analiz ve yorum.
  
### **3.2. AI Entegrasyonu**
- Açık ve ücretsiz AI API anahtarı kullanılacaktır.
- AI, kullanıcının rüya metnini analiz ederek anlamlı bir yorum döndürecektir.
- API çağrıları güvenli ve hızlı olacak şekilde optimize edilmelidir.

### **3.3. Teknik Gereksinimler**
- **Frontend:** React, Vue.js veya başka bir modern JavaScript framework’ü.
- **Backend:** Node.js veya Python (FastAPI/Django) ile API isteklerini işleyebilecek bir yapı.
- **AI API Entegrasyonu:** OpenAI, Cohere veya Hugging Face gibi AI sağlayıcılarının ücretsiz API anahtarları kullanılacaktır.
- **Veritabanı:** Kullanıcı verisi tutulmayacaktır. Ancak, opsiyonel olarak geçmiş sorguların anonim olarak kaydedilmesi düşünülebilir.

## **4. Kullanıcı Hikayeleri (User Stories)**

### **4.1. Temel Kullanıcı Hikayeleri**
1. **Kullanıcı olarak**, rüyamı metin kutusuna girerek analiz almak istiyorum, böylece AI’nin yorumunu görebilirim.
2. **Kullanıcı olarak**, AI’nin verdiği yorumları açık ve anlaşılır bir şekilde görmek istiyorum.
3. **Kullanıcı olarak**, hizmetin ücretsiz olduğunu ve AI’nin nasıl çalıştığını öğrenmek istiyorum.

### **4.2. Teknik Kullanıcı Hikayeleri**
1. **Geliştirici olarak**, AI API’sine yapılan isteklerin hızını ve doğruluğunu artırmak için optimizasyon yapmak istiyorum.
2. **Geliştirici olarak**, kullanıcı girdisinin güvenliğini sağlamak için temel giriş doğrulamalarını (örneğin, karakter limiti ve zararlı içerik filtreleme) uygulamak istiyorum.
3. **Geliştirici olarak**, AI API anahtarının kötüye kullanımını önlemek için rate limiting uygulamak istiyorum.

## **5. Performans ve Güvenlik Gereksinimleri**
- API çağrılarının 3 saniyeden kısa sürede yanıt vermesi hedeflenmektedir.
- Kullanıcı girdileri saklanmayacak, ancak opsiyonel olarak anonimleştirilmiş veriler analiz için kullanılabilir.
- AI yanıtları kullanıcı dostu hale getirilerek toksik içerik filtreleme mekanizmaları uygulanmalıdır.

## **6. Kullanıcı Deneyimi (UX) ve Arayüz (UI) Tasarımı**
- Minimalist ve sade bir arayüz.
- Mobil ve masaüstü uyumlu tasarım.
- AI'nin çalışma prensibini anlatan küçük bir bilgi kutusu.

## **7. Zaman Çizelgesi ve MVP Kapsamı**
**MVP (Minimum Viable Product) İçeriği:**
- Kullanıcıdan rüya metni alma
- AI API ile entegrasyon
- Yanıtın kullanıcıya gösterilmesi
- Basit ve kullanıcı dostu bir arayüz

**Tahmini Geliştirme Süresi:** 4-6 hafta
- **Hafta 1-2:** UI/UX tasarımı ve frontend geliştirme
- **Hafta 3-4:** Backend geliştirme ve AI API entegrasyonu
- **Hafta 5:** Test ve hata düzeltmeleri
- **Hafta 6:** Yayına alma ve optimizasyon

## **8. Gelecek Geliştirmeler**
- Kullanıcıların rüya yorumlarını değerlendirme ve geri bildirim verme özelliği.
- Kendi rüya yorumlarını saklayabilecekleri bir hesap oluşturma seçeneği.
- Daha gelişmiş AI modellerinin entegrasyonu.

---

Bu PRD, rüya yorumlayan bir web uygulaması için temel gereksinimleri belirlemektedir. Daha fazla detay ve revizyon gerektiğinde güncellenebilir.