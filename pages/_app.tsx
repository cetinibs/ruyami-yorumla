import { Inter } from 'next/font/google';
import '../styles/globals.css';
import type { AppProps } from 'next/app';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  );
}
