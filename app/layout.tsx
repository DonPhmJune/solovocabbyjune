import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Solo Quiz — Trắc nghiệm từ vựng tiếng Anh',
  description: 'Tạo phòng trắc nghiệm từ vựng và mời bạn bè thi cùng.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}