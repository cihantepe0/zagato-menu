import './globals.css';

export const metadata = {
  title: 'Zagato Palazzo | Fine Dining Menu',
  description: 'Zagato Palazzo Restaurant Dijital Menü — İyi Yemek, İyi Müzik, İyi Martesi. Since 2020.',
  themeColor: '#080604',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
