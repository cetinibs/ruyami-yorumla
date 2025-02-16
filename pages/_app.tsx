import { Inter } from 'next/font/google';
import { appWithTranslation } from 'next-i18next';
import '../styles/globals.css';
import type { AppProps } from 'next/app';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

function App({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  );
}

export default appWithTranslation(App);
