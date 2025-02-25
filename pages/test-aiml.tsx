import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function TestAimlPage() {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const testApi = async () => {
      try {
        const response = await fetch('/api/test-aiml');
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

    testApi();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>AIML API Test Sayfası</title>
      </Head>

      <h1 className="text-2xl font-bold mb-4">AIML API Test Sayfası</h1>

      {loading ? (
        <p>AIML API test ediliyor...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Hata:</strong> {error}</p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">API Durumu</h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium">Test Sonucu</h3>
            <div className={`p-3 rounded ${apiStatus.status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
              {apiStatus.status === 'success' ? (
                <div className="text-green-700">
                  <p>✅ AIML API çalışıyor</p>
                  <p className="mt-2"><strong>Model:</strong> {apiStatus.details?.model}</p>
                  <p className="mt-2"><strong>Yanıt:</strong> {apiStatus.details?.response}</p>
                </div>
              ) : (
                <div className="text-red-700">
                  <p>❌ AIML API hatası:</p>
                  <pre className="whitespace-pre-wrap text-sm mt-2 bg-gray-50 p-2 rounded">
                    {JSON.stringify(apiStatus.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium">API Bilgileri</h3>
            <div className="bg-gray-100 p-3 rounded">
              <p><strong>API Anahtarı:</strong> {apiStatus.apiKey}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium">Sonraki Adımlar</h3>
            <ul className="list-disc pl-5 mt-2">
              <li>API çalışıyorsa, ana sayfaya dönüp rüya yorumlama özelliğini test edin.</li>
              <li>API çalışmıyorsa, hata mesajlarını inceleyerek sorunları giderin.</li>
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
