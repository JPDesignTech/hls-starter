import * as React from 'react';
import { Github, Heart, Zap } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
          {/* About Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">About BeemMeUp</h3>
            </div>
            <p className="text-sm leading-relaxed">
              BeemMeUp was created as a dogfooding effort for learning HLS and building tools at{' '}
              <Link 
                href="https://www.descript.com/" 
                target="_blank" 
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Descript
              </Link>
              . It demonstrates the power of AI-assisted development by building a production-ready 
              HLS analysis tool that generates playlists and provides deep inspection of video segments.
            </p>
          </div>

          {/* Technical Details Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Technical Stack</h3>
            <div className="text-sm space-y-1">
              <p>
                <span className="text-gray-400">Frontend:</span> Next.js 15, React, TypeScript, TailwindCSS
              </p>
              <p>
                <span className="text-gray-400">Backend:</span> Vercel Edge Functions, Node.js
              </p>
              <p>
                <span className="text-gray-400">Video Processing:</span> Google Cloud Transcoder for HLS playlist generation
              </p>
              <p>
                <span className="text-gray-400">Storage:</span> Google Cloud Storage, Redis (Upstash)
              </p>
              <p>
                <span className="text-gray-400">Analysis:</span> FFprobe service for deep HLS segment inspection
              </p>
            </div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-300">
              Built with <Heart className="inline h-4 w-4 text-red-500" /> by{' '}
              <span className="font-semibold text-white">Jean Perez</span>
            </p>
            <Link
              href="https://github.com/JPDesignTech"
              target="_blank"
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="text-sm">@JPDesignTech</span>
            </Link>
          </div>

          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} BeemMeUp. Open source project.
          </div>
        </div>

                  {/* Hosting Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Hosted on{' '}
            <Link 
              href="https://vercel.com" 
              target="_blank" 
              className="text-gray-400 hover:text-gray-300 underline"
            >
              Vercel
            </Link>
            {' '}with{' '}
            <Link 
              href="https://cloud.google.com" 
              target="_blank" 
              className="text-gray-400 hover:text-gray-300 underline"
            >
              Google Cloud
            </Link>
            {' '}infrastructure
          </p>
        </div>

        {/* HLS Resources */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-400 mb-2">Built with reference to:</p>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <Link
              href="https://datatracker.ietf.org/doc/html/draft-pantos-hls-rfc8216bis"
              target="_blank"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              HLS RFC 8216bis
            </Link>
            <span className="text-gray-600">•</span>
            <Link
              href="https://developer.apple.com/streaming/examples/"
              target="_blank"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Apple HLS Examples
            </Link>
            <span className="text-gray-600">•</span>
            <Link
              href="https://developer.apple.com/documentation/http-live-streaming/using-apple-s-http-live-streaming-hls-tools"
              target="_blank"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Apple HLS Tools
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 