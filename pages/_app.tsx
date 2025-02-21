import { Inter } from 'next/font/google';
import { appWithTranslation } from 'next-i18next';
import { ThemeProvider } from '../contexts/ThemeContext';
import '../styles/globals.css';
import '../styles/theme.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const changeLanguage = (language: string) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: language });
  };

  return (
    <ThemeProvider>
      <main className={inter.className}>
        <Component {...pageProps} />
        <div className="fixed bottom-4 right-4 z-50">
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            value={router.locale}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
      </main>
    </ThemeProvider>
  );
}

export default appWithTranslation(MyApp);
