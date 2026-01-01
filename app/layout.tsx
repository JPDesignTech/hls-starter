import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Footer } from '@/components/footer';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: 'BeemMeUp - HLS Video Analysis & Playlist Generator',
  description: 'Analyze video files and generate HLS playlists with BeemMeUp. Deep inspection of HLS segments, quality levels, and adaptive bitrate configurations.',
  keywords: 'HLS, video analysis, playlist generator, adaptive bitrate, video transcoding, HLS analyzer',
  icons: {
    icon: '/icon',
    shortcut: '/icon',
    apple: '/icon',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {/* Gradient background */}
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 animate-gradient -z-10" />
        
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none -z-10 content-container" />
        
        {/* Main content */}
        <main className="flex-1 relative z-0 main-content">
          {children}
        </main>
        
        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
