import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BeemMeUp - Lightning Fast HLS Video Streaming',
  description: 'Transform your videos into adaptive HLS streams with BeemMeUp. Upload once, stream everywhere with multiple quality levels.',
  keywords: 'HLS, video streaming, adaptive bitrate, video upload, transcoding',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
