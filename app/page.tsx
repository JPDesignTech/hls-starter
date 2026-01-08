'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Video, ShieldCheck, Terminal, LucideIcon, Info, Download, Check, Star, Rocket, ArrowRight, Users, Camera, Heart, Target, Code, GraduationCap, Play, Award, BookOpen } from 'lucide-react';
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
      {/* Hero Section - Default gradient background */}
      <div className="relative">
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

          {/* Featured Tutorial Hero Section */}
          <div className="py-8 mb-12">
            <div className="max-w-6xl mx-auto">
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600/30 via-purple-600/30 to-pink-600/30 backdrop-blur-sm border-2 border-indigo-400/50 rounded-3xl p-8 md:p-12 shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"></div>
                
                <div className="relative grid md:grid-cols-2 gap-8 items-center">
                  {/* Left Side - Content */}
                  <div>
                    <div className="inline-flex items-center gap-2 bg-indigo-500/30 border border-indigo-400/50 rounded-full px-4 py-1 mb-4">
                      <GraduationCap className="w-4 h-4 text-indigo-300" />
                      <span className="text-indigo-200 text-sm">New Learning Path</span>
                    </div>
                    
                    <h2 className="text-white text-4xl font-bold mb-4">
                      Interactive FFMPEG Tutorials
                    </h2>
                    
                    <p className="text-white/80 text-lg mb-6 leading-relaxed">
                      Master FFMPEG from the ground up with our comprehensive, interactive tutorial series. 
                      Learn by doing with real-time command execution, visual examples, and hands-on challenges.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <div className="text-white text-2xl mb-1 font-bold">12</div>
                        <div className="text-white/60 text-sm">Lessons</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <div className="text-white text-2xl mb-1 font-bold">3h</div>
                        <div className="text-white/60 text-sm">Duration</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <div className="text-white text-2xl mb-1 font-bold">24</div>
                        <div className="text-white/60 text-sm">Exercises</div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link href="/learn">
                      <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3 group">
                        <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-lg">Start Learning FFMPEG</span>
                      </Button>
                    </Link>
                  </div>

                  {/* Right Side - Preview */}
                  <div className="space-y-4">
                    {/* Course Modules Preview */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-5 h-5 text-indigo-400" />
                        <span className="text-white font-semibold">What You'll Learn</span>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-400/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-400 text-xs">✓</span>
                          </div>
                          <span className="text-white/80 text-sm">FFMPEG fundamentals and architecture</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-400/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-400 text-xs">✓</span>
                          </div>
                          <span className="text-white/80 text-sm">Essential flags and their usage</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-400/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-400 text-xs">✓</span>
                          </div>
                          <span className="text-white/80 text-sm">Video/audio processing techniques</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-400/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-400 text-xs">✓</span>
                          </div>
                          <span className="text-white/80 text-sm font-medium">Real-world examples and best practices</span>
                        </li>
                      </ul>
                    </div>

                    {/* Certificate Badge */}
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50 rounded-xl p-4 flex items-center gap-3">
                      <Award className="w-8 h-8 text-yellow-400" />
                      <div>
                        <div className="text-white text-sm font-semibold">Earn a certificate</div>
                        <div className="text-white/60 text-xs">Complete all lessons to get certified</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tools Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">Our Tools</h2>
              <p className="text-lg text-gray-300">Professional video processing and analysis tools</p>
            </div>
            
            {/* Feature Modules Grid (2x2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      {/* About Section - Dark Purple Backdrop */}
      <div id="about" className="relative bg-purple-950/50 py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">About BeemMeUp</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              We're on a mission to make video processing accessible, educational, and powerful for everyone. BeemMeUp combines cutting-edge technology with an intuitive interface to help you master FFMPEG and media analysis.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
            <Card className="bg-purple-800/40 border-purple-700/30 text-center">
              <CardContent className="pt-6 pb-6">
                <div className="flex justify-center mb-3">
                  <Users className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">50K+</div>
                <div className="text-sm text-gray-300">Active Users</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-800/40 border-purple-700/30 text-center">
              <CardContent className="pt-6 pb-6">
                <div className="flex justify-center mb-3">
                  <Camera className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">1M+</div>
                <div className="text-sm text-gray-300">Files Processed</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-800/40 border-purple-700/30 text-center">
              <CardContent className="pt-6 pb-6">
                <div className="flex justify-center mb-3">
                  <ShieldCheck className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                <div className="text-sm text-gray-300">Uptime</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-800/40 border-purple-700/30 text-center">
              <CardContent className="pt-6 pb-6">
                <div className="flex justify-center mb-3">
                  <Heart className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">24/7</div>
                <div className="text-sm text-gray-300">Support</div>
              </CardContent>
            </Card>
          </div>

          {/* Feature/Value Proposition Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-purple-800/40 border-purple-700/30">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-orange-500 flex items-center justify-center">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-3">Our Mission</h3>
                <p className="text-gray-300 text-center text-sm leading-relaxed">
                  Democratize video processing and FFMPEG knowledge. We believe everyone should have access to professional-grade media tools and the education to use them effectively.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-purple-800/40 border-purple-700/30">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-pink-500 flex items-center justify-center">
                    <Code className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-3">Built for Creators</h3>
                <p className="text-gray-300 text-center text-sm leading-relaxed">
                  Whether you're a content creator, developer, or video professional, BeemMeUp provides the tools you need to analyze, process, and understand your media files.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-purple-800/40 border-purple-700/30">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-blue-400 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-3">Community Driven</h3>
                <p className="text-gray-300 text-center text-sm leading-relaxed">
                  We listen to our users and continuously improve based on feedback. Our roadmap is shaped by the real needs of video professionals and enthusiasts.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pricing Section - Lighter Purple/Violet Backdrop */}
      <div id="pricing" className="relative bg-violet-950/40 py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Choose the plan that fits your needs. Start free and upgrade as you grow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Free Tier */}
            <Card className="bg-gradient-to-br from-purple-600/25 to-pink-600/25 border-purple-500/30 relative">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <Star className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-white text-2xl mb-2">Free</CardTitle>
                <CardDescription className="text-gray-300">
                  Perfect for learning and experimenting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">$0</span>
                    <span className="text-gray-400 text-sm">/forever</span>
                  </div>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">FFMPEG Command Builder</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Basic HLS Analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Up to 100MB file uploads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">5 analyses per day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Community support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Basic corruption detection</span>
                  </li>
                </ul>
                <Link href="/">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Tier - Most Popular */}
            <Card className="bg-gradient-to-br from-yellow-600/25 to-orange-600/25 relative border-2 border-yellow-400/50">
              {/* Most Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Most Popular
                </div>
              </div>
              <CardHeader className="text-center pb-4 pt-6">
                <div className="flex justify-center mb-4">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-white text-2xl mb-2">Pro</CardTitle>
                <CardDescription className="text-gray-300">
                  For professionals and content creators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">$29</span>
                    <span className="text-gray-400 text-sm">/per month</span>
                  </div>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Everything in Free</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Unlimited file uploads (up to 5GB)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Unlimited analyses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Advanced HLS processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Batch processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">API access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Custom FFMPEG templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Export analysis reports</span>
                  </li>
                </ul>
                <Link href="/">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-lg font-semibold">
                    Start Pro Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Tier */}
            <Card className="bg-gradient-to-br from-teal-600/25 to-cyan-600/25 border-teal-500/30 relative">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <Rocket className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-white text-2xl mb-2">Enterprise</CardTitle>
                <CardDescription className="text-gray-300">
                  For teams and organizations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">Custom</span>
                    <span className="text-gray-400 text-sm">/contact us</span>
                  </div>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Everything in Pro</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Unlimited file size</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Dedicated infrastructure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Custom integrations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">SSO & advanced security</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">SLA guarantee</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">On-premise deployment option</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Custom training sessions</span>
                  </li>
                </ul>
                <Link href="/">
                  <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-lg">
                    Contact Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          {/* Footer Text */}
          <div className="text-center mt-12">
            <p className="text-gray-300 text-sm">
              All plans include a 14-day free trial. No credit card required.{' '}
              <Link href="/" className="text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1">
                Compare all features
                <ArrowRight className="h-4 w-4" />
              </Link>
            </p>
          </div>
        </div>

        {/* Download Section */}
        <div id="download" className="mt-24 pt-16 scroll-mt-16 pb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center space-x-2 mb-4">
              <Download className="h-8 w-8 text-green-400" />
              <h2 className="text-4xl font-bold text-white">Download</h2>
            </div>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Access BeemMeUp directly in your browser - no installation required.
            </p>
          </div>
          <Card className="bg-gradient-to-br from-green-600/25 to-emerald-600/25 border-green-500/30 max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <p className="text-lg text-gray-200">
                  BeemMeUp is a web-based platform that runs entirely in your browser. Simply visit our website 
                  to start using all our video processing tools - no downloads or installations needed.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3 text-gray-300">
                    <Check className="h-5 w-5 text-green-400" />
                    <span>Works on all modern browsers</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-gray-300">
                    <Check className="h-5 w-5 text-green-400" />
                    <span>No installation required</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-gray-300">
                    <Check className="h-5 w-5 text-green-400" />
                    <span>Access from any device</span>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-sm text-gray-400 mb-4">
                    Desktop apps and browser extensions coming soon!
                  </p>
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                      Start Using BeemMeUp
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
