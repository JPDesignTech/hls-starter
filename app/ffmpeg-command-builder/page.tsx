'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CommandBuilder } from '@/components/ffmpeg/command-builder';

export default function FFMPEGCommandBuilderPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative">
      {/* Override purple background with teal/cyan theme */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900 animate-gradient -z-10" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none -z-10" />
      
      <div className="relative z-0">
        <CommandBuilder onBack={() => router.push('/')} />
      </div>
    </div>
  );
}
