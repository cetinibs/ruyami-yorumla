import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function TestPage() {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const testApis = async () => {
      try {
        const response = await fetch('/api/test-api');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setApiStatus(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    testApis();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>API Test Sayfası</title>
      </Head>

      <h1 className="text-2xl font-bold mb-4">API Test Sayfası</h1>

      {loading ? (
        <p>API'ler test ediliyor...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Hata:</strong> {error}</p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">API Durumları</h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium">Çevre Değişkenleri</h3>
            <div className="bg-gray-100 p-3 rounded">
              <p>DeepSeek API Anahtarı: {apiStatus.env?.hasDeepseekKey ? '✅ Mevcut' : '❌ Eksik'}</p>
              <p>Gemini API Anahtarı: {apiStatus.env?.hasGeminiKey ? '✅ Mevcut' : '❌ Eksik'}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium">DeepSeek API</h3>
            <div className={`p-3 rounded ${apiStatus.deepseekStatus === 'OK' ? 'bg-green-100' : 'bg-red-100'}`}>
              {apiStatus.deepseekStatus === 'OK' ? (
                <p className="text-green-700">✅ DeepSeek API çalışıyor</p>
              ) : (
                <div className="text-red-700">
                  <p>❌ DeepSeek API hatası:</p>
                  <pre className="whitespace-pre-wrap text-sm mt-2 bg-gray-50 p-2 rounded">
                    {apiStatus.deepseekError}
                  </pre>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Gemini API</h3>
            <div className={`p-3 rounded ${apiStatus.geminiStatus === 'OK' ? 'bg-green-100' : 'bg-red-100'}`}>
              {apiStatus.geminiStatus === 'OK' ? (
                <p className="text-green-700">✅ Gemini API çalışıyor</p>
              ) : (
                <div className="text-red-700">
                  <p>❌ Gemini API hatası:</p>
                  <pre className="whitespace-pre-wrap text-sm mt-2 bg-gray-50 p-2 rounded">
                    {apiStatus.geminiError}
                  </pre>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium">Sonraki Adımlar</h3>
            <ul className="list-disc pl-5 mt-2">
              <li>API anahtarları eksikse, <code>.env</code> dosyasını kontrol edin.</li>
              <li>API hataları varsa, hata mesajlarını inceleyerek sorunları giderin.</li>
              <li>Tüm API'ler çalışıyorsa, ana sayfaya dönüp rüya yorumlama özelliğini test edin.</li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <a href="/" className="text-blue-500 hover:underline">Ana Sayfaya Dön</a>
      </div>
    </div>
  );
}
