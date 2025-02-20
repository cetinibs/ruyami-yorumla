import { Inter } from 'next/font/google';
import { appWithTranslation } from 'next-i18next';
import '../styles/globals.css';
import '../styles/theme.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '../contexts/ThemeContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <main className={inter.className}>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  );
}

export default appWithTranslation(MyApp);
