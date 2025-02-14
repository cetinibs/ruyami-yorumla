import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

type Dream = {
  _id: string;
  dreamText: string;
  interpretation: string;
  createdAt: string;
};

type User = {
  _id: string;
  name: string;
  email: string;
};

export default function Home() {
  const router = useRouter();
  const [dream, setDream] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [showLogin, setShowLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchDreams(token);
    }
  }, []);

  const fetchDreams = async (token: string) => {
    try {
      const response = await fetch('/api/dreams', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDreams(data);
      }
    } catch (error) {
      console.error('Error fetching dreams:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent, isLogin: boolean) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`/api/auth/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isLogin ? { email, password } : { email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      if (isLogin) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        fetchDreams(data.token);
      } else {
        setShowLogin(true);
      }

      setEmail('');
      setPassword('');
      setName('');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDreams([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInterpretation('');
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Eğer kullanıcı giriş yapmışsa token ekle
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers,
        body: JSON.stringify({ dream }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Bir hata oluştu');
      }
      
      setInterpretation(data.interpretation);

      // Giriş yapmış kullanıcı için rüya listesini güncelle
      if (token) {
        fetchDreams(token);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Rüya yorumlanırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <Head>
        <title>Rüya Yorumla AI</title>
        <meta name="description" content="AI destekli rüya yorumlama uygulaması" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">
            Rüya Yorumla AI
          </h1>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-600">Merhaba, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => setShowLogin(false)}
                  className="px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white"
                >
                  Üye Ol
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sol Menü - Geçmiş Sorgular (sadece giriş yapmış kullanıcılar için) */}
          {user && (
            <div className="md:col-span-1 space-y-4">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Geçmiş Sorgular</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {dreams.map((dream) => (
                    <div
                      key={dream._id}
                      className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setDream(dream.dreamText);
                        setInterpretation(dream.interpretation);
                      }}
                    >
                      <p className="text-sm text-gray-600">
                        {new Date(dream.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                      <p className="line-clamp-2">{dream.dreamText}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ana İçerik */}
          <div className={`${user ? 'md:col-span-3' : 'md:col-span-4'}`}>
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Üyelik Modalı */}
              {!user && (showLogin !== null) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">
                        {showLogin ? 'Giriş Yap' : 'Üye Ol'}
                      </h2>
                      <button
                        onClick={() => setShowLogin(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={(e) => handleAuth(e, showLogin)} className="space-y-4">
                      {!showLogin && (
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            İsim
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-primary"
                            required
                          />
                        </div>
                      )}

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="input-primary"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Şifre
                        </label>
                        <input
                          type="password"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="input-primary"
                          required
                        />
                      </div>

                      {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-600">{error}</p>
                        </div>
                      )}

                      <button type="submit" className="btn-primary w-full">
                        {showLogin ? 'Giriş Yap' : 'Üye Ol'}
                      </button>

                      <p className="text-center text-sm text-gray-600">
                        {showLogin ? (
                          <>
                            Hesabınız yok mu?{' '}
                            <button
                              type="button"
                              onClick={() => setShowLogin(false)}
                              className="text-primary hover:underline"
                            >
                              Üye Olun
                            </button>
                          </>
                        ) : (
                          <>
                            Zaten üye misiniz?{' '}
                            <button
                              type="button"
                              onClick={() => setShowLogin(true)}
                              className="text-primary hover:underline"
                            >
                              Giriş Yapın
                            </button>
                          </>
                        )}
                      </p>
                    </form>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="dream" className="block text-sm font-medium text-gray-700 mb-1">
                    Rüyanızı anlatın (maksimum 500 karakter)
                  </label>
                  <textarea
                    id="dream"
                    value={dream}
                    onChange={(e) => setDream(e.target.value)}
                    maxLength={500}
                    rows={6}
                    className="input-primary"
                    placeholder="Rüyanızı buraya yazın..."
                    required
                  />
                  <div className="text-sm text-gray-500 text-right">
                    {dream.length}/500
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || dream.length === 0}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Yorumlanıyor...' : 'Yorumla'}
                </button>

                {!user && (
                  <p className="text-sm text-gray-600 text-center">
                    Rüya yorumlarınızı kaydetmek ve daha sonra görüntülemek için{' '}
                    <button
                      type="button"
                      onClick={() => setShowLogin(false)}
                      className="text-primary hover:underline"
                    >
                      üye olun
                    </button>
                  </p>
                )}
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {interpretation && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">Rüya Yorumu</h2>
                  <div className="space-y-6 bg-gray-50 rounded-lg p-6">
                    {interpretation.split('**').filter(Boolean).map((section, index) => {
                      const [title, ...content] = section.split('\n');
                      if (title && content.length > 0) {
                        return (
                          <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                            <h3 className="text-lg font-semibold text-primary mb-3">
                              {title.replace(/^\d+\.\s*/, '')}
                            </h3>
                            <div className="prose max-w-none space-y-2">
                              {content.filter(line => line.trim()).map((line, idx) => {
                                if (line.trim().startsWith('-')) {
                                  // Liste öğesi
                                  return (
                                    <div key={idx} className="flex items-start space-x-2 ml-2">
                                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                      <p className="text-gray-700">
                                        {line.replace('-', '').trim()}
                                      </p>
                                    </div>
                                  );
                                } else {
                                  // Normal paragraf
                                  return (
                                    <p key={idx} className="text-gray-700">
                                      {line.trim()}
                                    </p>
                                  );
                                }
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              <div className="mt-6 text-sm text-gray-500">
                <p>Bu uygulama yapay zeka teknolojisi kullanarak rüyalarınızı yorumlar. 
                   Sonuçlar sadece bilgilendirme amaçlıdır.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
