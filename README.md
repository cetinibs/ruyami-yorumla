# Rüya Yorumla AI

Modern web teknolojileri kullanılarak geliştirilmiş, yapay zeka destekli rüya yorumlama uygulaması.

## Teknolojiler

- Next.js - React tabanlı web framework
- Tailwind CSS - Utility-first CSS framework
- MongoDB - NoSQL veritabanı
- Express.js - Node.js web uygulama framework'ü
- Node.js - JavaScript runtime
- React.js - UI kütüphanesi
- Gemini AI - Google'ın yapay zeka modeli
- DeepSeek AI - Gelişmiş dil modeli

## Başlangıç

Projeyi yerel ortamınızda çalıştırmak için:

1. Depoyu klonlayın
```bash
git clone [repo-url]
```

2. Bağımlılıkları yükleyin
```bash
npm install
```

3. `.env.example` dosyasını `.env` olarak kopyalayın ve API anahtarlarınızı ekleyin
```bash
cp .env.example .env
```

4. Geliştirme sunucusunu başlatın
```bash
npm run dev
```

5. Tarayıcınızda http://localhost:3000 adresini açın

## Özellikler

- Rüya metni girişi (maksimum 1000 karakter)
- AI destekli rüya yorumlama
  - Gemini AI entegrasyonu
  - DeepSeek AI entegrasyonu
- Kullanıcı tercihine göre AI model seçimi
- Modern ve sade kullanıcı arayüzü
- Mobil uyumlu tasarım

## API Anahtarları

Uygulama şu API anahtarlarını kullanmaktadır:

- `GEMINI_API_KEY`: Google Gemini API anahtarı
- `DEEPSEEK_API_KEY`: DeepSeek API anahtarı

Bu anahtarları `.env` dosyasında tanımlamanız gerekmektedir.
