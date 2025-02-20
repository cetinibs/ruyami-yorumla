import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabaseSecret = 'your-supabase-secret';
const supabase = createClient(supabaseUrl, supabaseKey, supabaseSecret);

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
  const { theme, toggleTheme } = useTheme();
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
      // Use relative URL for API requests
      const apiUrl = '/api/dreams';

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch dreams:', errorText);
        throw new Error('Rüyalar yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Geçersiz veri formatı');
      }

      setDreams(data);
    } catch (error) {
      console.error('Error fetching dreams:', error);
      // Don't show error to user, just log it
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error('Login error:', error);
        throw new Error(error.message === 'Invalid login credentials' 
          ? 'Geçersiz email veya şifre'
          : error.message);
      }

      if (!data?.user || !data?.session) {
        console.error('No user or session data:', data);
        throw new Error('Giriş başarısız. Lütfen tekrar deneyin.');
      }

      console.log('Login successful:', { user: data.user });
      localStorage.setItem('token', data.session.access_token);
      setUser(data.user);
      setShowLogin(false);
      await fetchDreams(data.session.access_token);

    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Giriş sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting signup with:', { email });
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('already registered')) {
          throw new Error('Bu email adresi zaten kayıtlı');
        }
        throw error;
      }

      if (!data?.user) {
        console.error('No user data:', data);
        throw new Error('Kayıt başarısız. Lütfen tekrar deneyin.');
      }

      console.log('Signup successful:', { user: data.user });
      setError('Kayıt başarılı! Lütfen email adresinize gönderilen onay linkine tıklayın.');
      setIsLoading(false);

    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Kayıt sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDreamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dream.trim()) {
      setError('Lütfen rüyanızı anlatın');
      return;
    }

    if (dream.trim().length > 1000) {
      setError('Rüya metni çok uzun (maksimum 1000 karakter)');
      return;
    }

    setIsLoading(true);
    setError('');
    setInterpretation('');

    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers,
        body: JSON.stringify({ dream: dream.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Rüya yorumlama sırasında bir hata oluştu');
      }

      if (!data.interpretation) {
        throw new Error('Rüya yorumu alınamadı');
      }

      setInterpretation(data.interpretation);
      
      if (token) {
        await fetchDreams(token).catch(error => {
          console.error('Failed to fetch dreams:', error);
        });
      }

    } catch (error: any) {
      console.error('Dream interpretation error:', error);
      setError(error.message || 'Bir hata oluştu');
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
    <div className="min-h-screen">
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        aria-label="Temayı değiştir"
        title={theme === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç'}
      >
        {theme === 'light' ? <FaMoon size={20} /> : <FaSun size={20} />}
      </button>

      <Head>
        <title>Rüyamı Yorumla - AI Destekli Rüya Yorumlama</title>
        <meta name="description" content="Yapay zeka destekli rüya yorumlama uygulaması ile rüyalarınızın anlamını keşfedin. Bilinçaltınızın mesajlarını çözümleyin." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="keywords" content="rüya yorumu, rüya tabirleri, rüya analizi, yapay zeka, AI, rüya yorumlama" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ruya-yorumla.vercel.app/" />
        <meta property="og:title" content="Rüyamı Yorumla - AI Destekli Rüya Yorumlama" />
        <meta property="og:description" content="Yapay zeka destekli rüya yorumlama uygulaması ile rüyalarınızın anlamını keşfedin." />
        <meta property="og:image" content="https://ruya-yorumla.vercel.app/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://ruya-yorumla.vercel.app/" />
        <meta property="twitter:title" content="Rüyamı Yorumla - AI Destekli Rüya Yorumlama" />
        <meta property="twitter:description" content="Yapay zeka destekli rüya yorumlama uygulaması ile rüyalarınızın anlamını keşfedin." />
        <meta property="twitter:image" content="https://ruya-yorumla.vercel.app/og-image.jpg" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://ruya-yorumla.vercel.app/" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
              <form onSubmit={handleDreamSubmit} className="space-y-6">
                <div>
                  <label htmlFor="dream" className="block text-lg font-medium text-gray-700 mb-2">
                    Rüyanızı Anlatın
                  </label>
                  <textarea
                    id="dream"
                    name="dream"
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Rüyanızı detaylı bir şekilde anlatın..."
                    value={dream}
                    onChange={(e) => setDream(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                      isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {isLoading ? 'Yorumlanıyor...' : 'Rüyamı Yorumla'}
                  </button>
                </div>

                {!user && (
                  <p className="text-sm text-gray-600 mt-2">
                    Not: Rüya yorumlarınızı kaydetmek ve geçmiş yorumlarınızı görmek için{' '}
                    <button
                      type="button"
                      onClick={() => setShowLogin(true)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      üye olun
                    </button>
                  </p>
                )}
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {interpretation && (
                <div className="dream-interpretation mt-8">
                  <div className="dream-interpretation-section">
                    <h3 className="dream-interpretation-title">Rüyanızın Genel Yorumu</h3>
                    <p className="dream-interpretation-content">{interpretation}</p>
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
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600">{successMessage}</p>
                </div>
              )}

              <form onSubmit={(e) => showLogin ? handleLogin(e) : handleSignup(e)} className="space-y-4">
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
