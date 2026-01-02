'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Video, ShieldCheck, Terminal, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import ModuleSpecTips from '@/components/module-spec-tips';

interface FeatureModule {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  href: string;
  gradient: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  buttonGradient: string;
}

export default function HomePage() {

  const featureModules: FeatureModule[] = [
    {
      id: 'hls',
      title: 'HLS Video Processing',
      description: 'Upload videos and generate HLS playlists with adaptive bitrate streaming',
      longDescription: 'Upload your video files to generate HLS playlists with multiple quality levels, or analyze existing HLS playlists with deep segment inspection, quality level analysis, and adaptive bitrate configurations.',
      icon: Video,
      href: '/hls-video-processing',
      gradient: 'from-purple-600/25 to-pink-600/25',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      buttonGradient: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
    },
    {
      id: 'what-ffmpeg',
      title: 'What the FFMPEG',
      description: 'Extremely detailed media file analysis with FFProbe, FFPlay, and FFMPEG',
      longDescription: 'Upload any media file (video, audio, or image) to get comprehensive analysis including stream information, frame-level data, packet inspection, bitstream visualization, and codec-specific details. Perfect for deep media file inspection and debugging.',
      icon: Zap,
      href: '/what-the-ffmpeg',
      gradient: 'from-yellow-600/25 to-orange-600/25',
      borderColor: 'border-yellow-500/30',
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400',
      buttonGradient: 'from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700',
    },
    {
      id: 'corruption-checker',
      title: 'Video Corruption Checker',
      description: 'Detect and fix common video file corruption issues',
      longDescription: 'Upload any video file to check for corruption issues including missing metadata, codec problems, sync issues, and damaged frames. Get detailed analysis and FFmpeg commands to fix detected problems.',
      icon: ShieldCheck,
      href: '/corruption-check',
      gradient: 'from-green-600/25 to-emerald-600/25',
      borderColor: 'border-green-500/30',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400',
      buttonGradient: 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
    },
    {
      id: 'command-builder',
      title: 'FFMPEG Command Builder',
      description: 'Learn FFMPEG by building commands or analyzing existing ones',
      longDescription: 'Interactive command builder with pre-defined operations or paste existing FFMPEG commands to visualize and understand what each flag does. Perfect for learning FFMPEG syntax and optimizing your video workflows.',
      icon: Terminal,
      href: '/ffmpeg-command-builder',
      gradient: 'from-teal-600/25 to-cyan-600/25',
      borderColor: 'border-teal-500/30',
      iconBg: 'bg-teal-500/20',
      iconColor: 'text-teal-400',
      buttonGradient: 'from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700',
    },
  ];

  return (
    <div className="min-h-screen content-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 content-container">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-2 mb-4">
            <Zap className="h-10 w-10 text-yellow-400" />
            <h1 className="text-5xl font-bold text-white">
              BeemMeUp
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            A comprehensive platform for video processing, HLS streaming, media analysis, and FFMPEG command building. 
            Explore our tools to upload videos, analyze media files, check for corruption, and learn FFMPEG commands ✨
          </p>
          <div className="max-w-3xl mx-auto mt-6">
            <ModuleSpecTips />
          </div>
        </div>

        {/* Feature Modules Grid (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {featureModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.id}
                className={`bg-gradient-to-br ${module.gradient} ${module.borderColor} border`}
                style={{ isolation: 'isolate', contain: 'layout style paint' }}
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <div className={`p-2 ${module.iconBg} rounded-lg`}>
                      <Icon className={`h-6 w-6 ${module.iconColor}`} />
                    </div>
                    {module.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-4">
                    {module.longDescription}
                  </p>
                  <Link href={module.href}>
                    <Button className={`w-full bg-gradient-to-r ${module.buttonGradient} text-white`}>
                      <Icon className="mr-2 h-4 w-4" />
                      Open {module.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
