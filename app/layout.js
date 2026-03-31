import './globals.css';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['300', '400', '600', '800'],
  display: 'swap',
});

export const metadata = {
  title: 'Shamrock | Menu',
  description: 'Shamrock Restaurant Menu',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={outfit.className}>
      <body>{children}</body>
    </html>
  );
}
