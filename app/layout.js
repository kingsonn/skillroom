import { Inter } from 'next/font/google';
import './globals.css';
import { metadata } from './config';
import { AuthStateHandler } from '../components/AuthStateHandler';
import { Providers } from '../components/Providers';

const inter = Inter({ subsets: ['latin'] });

export { metadata };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthStateHandler />
          {children}
        </Providers>
      </body>
    </html>
  );
}
