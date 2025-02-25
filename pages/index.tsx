import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import { createClient } from '@supabase/supabase-js';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// Initialize Supabase client
let supabase = null;

// Only initialize Supabase on the client side
if (typeof window !== 'undefined') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase initialized with URL:', supabaseUrl);
  } else {
    console.warn('Missing Supabase environment variables');
  }
}

type Dream = {
  id: string;
  dream_text: string;
  interpretation: string;
  created_at: string;
  ai_model?: string;
};

type User = {
  id: string;
  email: string;
};

export default function Home() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation('common');
  const [dream, setDream] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [showLogin, setShowLogin] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [aiModel, setAiModel] = useState('openai'); // Default to OpenAI model

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    if (!supabase) return;
    
    const { data: { user }, error } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      fetchDreams();
    }
  };

  const fetchDreams = async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('dreams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dreams:', error);
    } else {
      setDreams(data || []);
    }
  };

  const handleDreamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dream.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Use the selected AI model endpoint
      let endpoint;
      switch (aiModel) {
        case 'deepseek':
          endpoint = '/api/interpret-deepseek';
          break;
        case 'gemini':
          endpoint = '/api/interpret';
          break;
        case 'combined':
        default:
          endpoint = '/api/interpret-combined';
          break;
        case 'aiml':
          endpoint = '/api/interpret-aiml';
          break;
        case 'openai':
          endpoint = '/api/interpret-openai';
          break;
      }
      
      console.log(`Calling API endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dream: dream.trim() }),
      });

      console.log(`API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || 'Yorumlama sırasında bir hata oluştu');
      }

      const data = await response.json();
      console.log('API response data received');
      setInterpretation(data.interpretation);

    } catch (error) {
      console.error('Error in handleDreamSubmit:', error);
      setError(error.message || 'Rüya yorumlanırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Giriş sistemi şu anda kullanılamıyor');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setUser(data.user);
      setShowLogin(null);
      fetchDreams();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Kayıt sistemi şu anda kullanılamıyor');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      setError('Kayıt başarılı! Lütfen email adresinize gönderilen onay linkine tıklayın.');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    
    await supabase.auth.signOut();
    setUser(null);
    setDreams([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      <Head>
        <title>{t('title')}</title>
        <meta name="description" content={t('description')} />
      </Head>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <FaSun className="w-6 h-6" /> : <FaMoon className="w-6 h-6" />}
      </button>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          {t('title')}
        </h1>

        {/* Stats Section */}
        <div className="mb-12 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl text-center mb-6 text-blue-200">
            {t('discoverSecrets')}
          </h2>
          <div className="flex justify-center space-x-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-300 mb-2">84,632</div>
              <p className="text-blue-200">{t('monthlyDreams')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-300 mb-2">15,234</div>
              <p className="text-blue-200">{t('weeklyDreamers')}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-xl">
            <form onSubmit={handleDreamSubmit} className="space-y-6">
              <div>
                <label htmlFor="dream" className="block text-xl font-semibold text-blue-200 mb-3">
                  {t('dreamPlaceholder')}
                </label>
                <textarea
                  id="dream"
                  name="dream"
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 resize-none"
                  placeholder={t('dreamPlaceholder')}
                  value={dream}
                  onChange={(e) => setDream(e.target.value)}
                  required
                />
              </div>

              {/* AI Model Selector */}
              <div className="mb-4">
                <label htmlFor="aiModel" className="block text-sm font-medium text-gray-700 mb-1">
                  AI Modeli
                </label>
                <select
                  id="aiModel"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="aiml">AIML</option>
                  <option value="gemini">Gemini</option>
                  {/* DeepSeek option disabled due to insufficient balance */}
                  {/* <option value="deepseek">DeepSeek</option> */}
                  {/* <option value="combined">DeepSeek + Gemini (Karşılaştırmalı)</option> */}
                  <option value="openai">OpenAI</option>
                </select>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading || !dream.trim()}
                  className={`px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 ${
                    isLoading || !dream.trim()
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  }`}
                >
                  {isLoading ? t('loading') : t('interpretButton')}
                </button>
              </div>

              {!user && (
                <p className="text-sm text-gray-300 dark:text-gray-400 mt-4 text-center">
                  {t('notLoggedIn')}{' '}
                  <button
                    type="button"
                    onClick={() => setShowLogin(true)}
                    className="text-blue-400 hover:text-blue-300 font-medium underline"
                  >
                    {t('loginButton')}
                  </button>
                </p>
              )}
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200">
                {t(`error.${error}`)}
              </div>
            )}

            {interpretation && (
              <div className="max-w-2xl mx-auto mb-12 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 backdrop-blur-sm">
                <h2 className="text-2xl font-semibold mb-4 text-blue-200">
                  Rüya Yorumu
                </h2>
                <div className="bg-gray-800/70 rounded-lg p-4 text-white">
                  <div 
                    className="interpretation-container prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: interpretation
                        .replace(/## DeepSeek Yorumu:/g, '<div class="deepseek-section"><h2>DeepSeek Yorumu:</h2>')
                        .replace(/## Gemini Yorumu:/g, '</div><div class="gemini-section"><h2>Gemini Yorumu:</h2>')
                        .replace(/(\d+\.\s.*?)(?=\n)/g, '<h3>$1</h3>')
                        .replace(/\n\n/g, '</p><p>')
                        .replace(/\n/g, '<br>')
                        + '</div>'
                    }} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Auth Section */}
          {!user && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowLogin(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300"
              >
                {t('loginButton')}
              </button>
            </div>
          )}

          {/* Auth Modal */}
          {showLogin !== null && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-center mb-6 text-blue-200">
                  {showLogin ? t('loginButton') : t('signupButton')}
                </h2>

                <form onSubmit={showLogin ? handleLogin : handleSignup} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder={t('email')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder={t('password')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    {showLogin ? t('loginButton') : t('signupButton')}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowLogin(!showLogin)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {showLogin ? t('createAccount') : t('backToLogin')}
                  </button>
                </div>

                <button
                  onClick={() => setShowLogin(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* User's Dreams */}
          {user && dreams.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-blue-200 mb-6">{t('pastDreams')}</h2>
              <div className="space-y-4">
                {dreams.map((dream) => (
                  <div
                    key={dream.id}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors"
                  >
                    <p className="text-gray-200">{dream.dream_text}</p>
                    <p className="mt-2 text-blue-300">{dream.interpretation}</p>
                    <p className="mt-2 text-sm text-gray-400">
                      {new Date(dream.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
