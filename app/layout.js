import './globals.css';

export const metadata = {
  title: 'Zagato Palazzo | Fine Dining Menu',
  description: 'Zagato Palazzo Restaurant Dijital Menü — İyi Yemek, İyi Müzik. Since 2020.',
};

export const viewport = {
  themeColor: '#080604',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        {/* Preconnect to Google Fonts for faster load */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
