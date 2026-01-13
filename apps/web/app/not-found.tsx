'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 animate-gradient">
      <div className="fixed inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

      <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center space-x-2 mb-6">
            <Zap className="h-12 w-12 text-yellow-400" />
            <h1 className="text-5xl font-bold text-white">BeemMeUp</h1>
          </div>

          <h2 className="text-3xl font-semibold text-white mb-4">
            404 - Page Not Found
          </h2>

          <p className="text-lg text-gray-300 mb-8 max-w-md mx-auto">
            Looks like this page got lost in the stream! Let&apos;s get you back
            on track.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-medium text-white hover:from-purple-700 hover:to-pink-700 transition-colors"
          >
            <Zap className="h-4 w-4" />
            Back to BeemMeUp
          </Link>
        </div>
      </div>
    </div>
  );
}
