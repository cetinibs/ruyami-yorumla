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
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [showLogin, setShowLogin] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [registeredPassword, setRegisteredPassword] = useState('');

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
      console.log('Fetching dreams with token:', token);
      const response = await fetch('/api/dreams', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Dreams response status:', response.status);
      const responseText = await response.text();
      console.log('Dreams response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Dreams response parsing error:', { responseText, error: parseError });
        throw new Error('Rüyalar yüklenirken bir hata oluştu: Geçersiz sunucu yanıtı');
      }

      if (!response.ok) {
        console.error('Dreams fetch error:', data);
        throw new Error(data?.error || data?.details || 'Rüyalar yüklenirken bir hata oluştu');
      }

      if (!Array.isArray(data)) {
        console.error('Invalid dreams data format:', data);
        throw new Error('Rüyalar geçersiz formatta');
      }

      console.log('Dreams fetched successfully:', data.length);
      setDreams(data);
    } catch (error: any) {
      console.error('Fetch dreams error:', error);
      setError(error.message || 'Rüyalar yüklenirken bir hata oluştu');
      // Rüyalar yüklenemese bile uygulamanın çalışmaya devam etmesini sağla
      setDreams([]);
    }
  };

  const handleAuth = async (e: React.FormEvent, isLogin: boolean) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('Starting auth process:', isLogin ? 'login' : 'register');
      const response = await fetch(`/api/auth/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isLogin ? { email, password } : { email, password, name }),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', { responseText, error: parseError });
        throw new Error('Sunucu yanıtı geçerli bir JSON formatında değil. Lütfen tekrar deneyin.');
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.details || `${isLogin ? 'Giriş' : 'Kayıt'} işlemi başarısız oldu`);
      }

      if (isLogin) {
        if (!data?.token || !data?.user) {
          console.error('Invalid login response:', data);
          throw new Error('Geçersiz giriş yanıtı: Token veya kullanıcı bilgisi eksik');
        }

        console.log('Login successful, setting token and user data');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        // Giriş başarılı olduğunda dreams'i yükle
        try {
          await fetchDreams(data.token);
        } catch (fetchError) {
          console.error('Error fetching dreams after login:', fetchError);
          // Dreams yüklenemese bile login başarılı sayılır
        }

        setShowLogin(null); // Modal'ı kapat
      } else {
        // Kayıt başarılı olduğunda
        setSuccessMessage('Kayıt işlemi başarılı! Şimdi giriş yapabilirsiniz.');
        setRegisteredEmail(email);
        setRegisteredPassword(password);
        setShowLogin(true);
        
        // Giriş formunu önceden doldur
        setEmail(email);
        setPassword(password);
        
        // Diğer form alanlarını temizle
        setName('');
      }
    } catch (error: any) {
      console.error('Auth error:', { error, isLogin });
      setError(error.message || `${isLogin ? 'Giriş' : 'Kayıt'} işlemi sırasında bir hata oluştu`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInterpretation('');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Log request details
      console.log('Request details:', {
        url: '/api/interpret',
        method: 'POST',
        headers,
        body: { dream }
      });

      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers,
        body: JSON.stringify({ dream }),
      });

      // Log response details
      console.log('Response details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      // First try to get the raw response text
      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      // Then try to parse it as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed JSON data:', data);
      } catch (parseError) {
        console.error('JSON parse error:', {
          error: parseError,
          responseText,
          responseLength: responseText.length,
          firstChars: responseText.substring(0, 100)
        });
        throw new Error('Sunucu yanıtı JSON formatında değil. Ham yanıt: ' + responseText.substring(0, 100));
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.details || 'Rüya yorumlanırken bir hata oluştu');
      }

      if (!data?.interpretation) {
        console.error('Missing interpretation in response:', data);
        throw new Error('Yorumlama sonucu alınamadı');
      }

      setInterpretation(data.interpretation);
      
      // Başarılı yanıt aldıktan sonra rüyaları yenile
      if (token) {
        fetchDreams(token);
      }
    } catch (error: any) {
      console.error('Interpretation error:', {
        error,
        message: error.message,
        stack: error.stack
      });
      setError(error.message || 'Rüya yorumlanırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDreams([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Head>
        <title>Rüyamı Yorumla - AI Destekli Rüya Yorumlama</title>
        <meta name="description" content="Yapay zeka destekli rüya yorumlama uygulaması" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Rüyamı Yorumla
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Yapay zeka teknolojisi ile rüyalarınızın gizli anlamlarını keşfedin
          </p>
        </div>

        {/* Auth Buttons */}
        <div className="absolute top-4 right-4 flex space-x-4">
          {user ? (
            <div className="glass-effect rounded-full px-6 py-3 flex items-center space-x-4">
              <span className="text-gray-700">Merhaba, {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 font-medium"
              >
                Çıkış Yap
              </button>
            </div>
          ) : (
            <div className="glass-effect rounded-full p-1 flex space-x-2">
              <button
                onClick={() => setShowLogin(true)}
                className="px-6 py-2 text-gray-700 hover:bg-white rounded-full transition-colors"
              >
                Giriş Yap
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
              >
                Üye Ol
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          {/* Sol Menü - Geçmiş Rüyalar */}
          {user && (
            <div className="lg:col-span-1">
              <div className="glass-effect rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">Geçmiş Rüyalarınız</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {dreams.map((dream) => (
                    <div
                      key={dream._id}
                      onClick={() => {
                        setDream(dream.dreamText);
                        setInterpretation(dream.interpretation);
                      }}
                      className="p-4 rounded-xl bg-white/50 hover:bg-white cursor-pointer transition-all duration-200 border border-gray-100"
                    >
                      <p className="text-sm text-indigo-600 mb-2">
                        {new Date(dream.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                      <p className="text-gray-700 line-clamp-2">{dream.dreamText}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ana İçerik */}
          <div className={`${user ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <div className="dream-card">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="dream" className="block text-lg font-medium text-gray-700 mb-2">
                    Rüyanızı Anlatın
                  </label>
                  <textarea
                    id="dream"
                    value={dream}
                    onChange={(e) => setDream(e.target.value)}
                    maxLength={500}
                    rows={6}
                    className="input-primary"
                    placeholder="Rüyanızı detaylı bir şekilde anlatın..."
                    required
                  />
                  <div className="text-sm text-gray-500 text-right mt-1">
                    {dream.length}/500 karakter
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || dream.length === 0}
                  className="btn-primary w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Rüyanız Yorumlanıyor...</span>
                    </div>
                  ) : (
                    'Rüyamı Yorumla'
                  )}
                </button>

                {!user && (
                  <p className="text-center text-gray-600">
                    Rüya yorumlarınızı kaydetmek için{' '}
                    <button
                      type="button"
                      onClick={() => setShowLogin(false)}
                      className="text-indigo-600 hover:underline font-medium"
                    >
                      üye olun
                    </button>
                  </p>
                )}
              </form>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {interpretation && (
                <div className="mt-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Rüya Yorumu</h2>
                  <div className="space-y-6">
                    {interpretation.split('**').filter(Boolean).map((section, index) => {
                      const [title, ...content] = section.split('\n');
                      if (title && content.length > 0) {
                        return (
                          <div key={index} className="glass-effect rounded-xl p-6">
                            <h3 className="text-xl font-semibold text-indigo-600 mb-4">
                              {title.replace(/^\d+\.\s*/, '')}
                            </h3>
                            <div className="prose max-w-none space-y-3">
                              {content.filter(line => line.trim()).map((line, idx) => {
                                if (line.trim().startsWith('-')) {
                                  return (
                                    <div key={idx} className="flex items-start space-x-3 ml-4">
                                      <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2"></div>
                                      <p className="text-gray-700">
                                        {line.replace('-', '').trim()}
                                      </p>
                                    </div>
                                  );
                                }
                                return (
                                  <p key={idx} className="text-gray-700">
                                    {line.trim()}
                                  </p>
                                );
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
            </div>
          </div>
        </div>

        {/* Auth Modal */}
        {!user && showLogin !== null && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {showLogin ? 'Giriş Yap' : 'Üye Ol'}
                </h2>
                <button
                  onClick={() => {
                    setShowLogin(null);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-600">{successMessage}</p>
                </div>
              )}

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
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}

                <button type="submit" className="btn-primary w-full">
                  {showLogin ? 'Giriş Yap' : 'Üye Ol'}
                </button>

                <p className="text-center text-gray-600">
                  {showLogin ? (
                    <>
                      Hesabınız yok mu?{' '}
                      <button
                        type="button"
                        onClick={() => setShowLogin(false)}
                        className="text-indigo-600 hover:underline font-medium"
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
                        className="text-indigo-600 hover:underline font-medium"
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

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Bu uygulama yapay zeka teknolojisi kullanarak rüyalarınızı yorumlar.</p>
          <p>Sonuçlar sadece bilgilendirme amaçlıdır.</p>
        </div>
      </div>
    </div>
  );
}
