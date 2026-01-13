'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Menu, X, Video, ShieldCheck, Terminal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ToolModule {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  gradient: string;
}

const toolModules: ToolModule[] = [
  {
    id: 'hls',
    title: 'HLS Video Processing',
    description: 'Upload videos and generate HLS playlists with adaptive bitrate streaming',
    icon: Video,
    href: '/hls-video-processing',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    id: 'what-ffmpeg',
    title: 'What the FFMPEG',
    description: 'Extremely detailed media file analysis with FFProbe, FFPlay, and FFMPEG',
    icon: Zap,
    href: '/what-the-ffmpeg',
    gradient: 'from-yellow-600 to-orange-600',
  },
  {
    id: 'corruption-checker',
    title: 'Video Corruption Checker',
    description: 'Detect and fix common video file corruption issues',
    icon: ShieldCheck,
    href: '/corruption-check',
    gradient: 'from-green-600 to-emerald-600',
  },
  {
    id: 'command-builder',
    title: 'FFMPEG Command Builder',
    description: 'Learn FFMPEG by building commands or analyzing existing ones',
    icon: Terminal,
    href: '/ffmpeg-command-builder',
    gradient: 'from-teal-600 to-cyan-600',
  },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [toolsOpen, setToolsOpen] = React.useState(false);
  const pathname = usePathname();

  // Handle scrolling to hash on page load or after navigation
  React.useEffect(() => {
    const handleHashScroll = () => {
      if (pathname === '/' && window.location.hash) {
        const hash = window.location.hash.slice(1);
        // Wait for page to render
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            const navHeight = 64; // h-16 = 64px
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - navHeight;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            });
          }
        }, 300);
      }
    };

    handleHashScroll();
    
    // Also listen for hash changes
    window.addEventListener('hashchange', handleHashScroll);
    return () => window.removeEventListener('hashchange', handleHashScroll);
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    setMobileMenuOpen(false);
    setToolsOpen(false);
    
    // Handle smooth scrolling for hash links
    if (href.startsWith('#')) {
      // If already on home page, prevent navigation and scroll
      if (pathname === '/') {
        e.preventDefault();
        const sectionId = href.slice(1);
        const element = document.getElementById(sectionId);
        if (element) {
          const navHeight = 64; // h-16 = 64px
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navHeight;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }
      // If not on home page, allow Link to navigate, then scroll after navigation
    }
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-purple-900/95 border-b border-purple-700/50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => handleNavClick('/')}
            className="flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors"
          >
            <Zap className="h-6 w-6 text-yellow-400" />
            <span className="text-xl font-bold">BeemMeUp</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 h-full">
            <NavLink href="/" onClick={handleNavClick} isActive={isActive('/')}>
              Home
            </NavLink>
            <NavLink href="#about" onClick={handleNavClick} isActive={false}>
              About
            </NavLink>
            
            {/* Tools Dropdown */}
            <Popover open={toolsOpen} onOpenChange={setToolsOpen}>
              <PopoverTrigger asChild>
                <button
                  className={`
                    px-4 py-2 text-sm font-medium transition-colors h-full
                    flex items-center gap-1
                    ${toolsOpen 
                      ? 'text-white border-b-2 border-yellow-400' 
                      : 'text-gray-200 hover:text-white'
                    }
                  `}
                >
                  Tools
                  <ChevronDown className={`h-4 w-4 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
                </button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[600px] p-4 bg-purple-900/98 border-purple-700/50 backdrop-blur-md"
                align="start"
                sideOffset={8}
              >
                <div className="grid grid-cols-2 gap-3">
                  {toolModules.map((module) => {
                    const Icon = module.icon;
                    return (
                      <Link
                        key={module.id}
                        href={module.href}
                        onClick={(e) => {
                          setToolsOpen(false);
                          handleNavClick(e, module.href);
                        }}
                        className={`
                          p-4 rounded-lg border transition-all cursor-pointer
                          bg-gradient-to-br ${module.gradient}/20
                          border-purple-500/30
                          hover:border-purple-400/50 hover:bg-gradient-to-br ${module.gradient}/30
                          group
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${module.gradient}/30`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-yellow-400 transition-colors">
                              {module.title}
                            </h3>
                            <p className="text-xs text-gray-300 line-clamp-2">
                              {module.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            <NavLink href="#pricing" onClick={handleNavClick} isActive={false}>
              Pricing
            </NavLink>
            <NavLink href="#download" onClick={handleNavClick} isActive={false}>
              Download
            </NavLink>
          </div>

          {/* Desktop Login Button */}
          <div className="hidden md:block">
            <Button
              variant="outline"
              className="border-2 border-purple-400 text-purple-300 hover:bg-purple-400/10 hover:text-white hover:border-purple-300 bg-transparent"
              onClick={() => {
                // Placeholder for login functionality
                console.log('Login clicked');
              }}
            >
              Log In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-purple-900/98 border-b border-purple-700/50 backdrop-blur-md">
          <div className="px-4 py-4 space-y-1">
            <MobileNavLink href="/" onClick={handleNavClick} isActive={isActive('/')}>
              Home
            </MobileNavLink>
            <MobileNavLink href="#about" onClick={handleNavClick} isActive={false}>
              About
            </MobileNavLink>
            
            {/* Mobile Tools Section */}
            <div className="pt-2 pb-2">
              <button
                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-200 hover:text-white transition-colors"
                onClick={() => setToolsOpen(!toolsOpen)}
              >
                <span>Tools</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>
              {toolsOpen && (
                <div className="mt-2 ml-4 space-y-2 border-l-2 border-purple-700/50 pl-4">
                  {toolModules.map((module) => {
                    const Icon = module.icon;
                    return (
                      <Link
                        key={module.id}
                        href={module.href}
                        onClick={() => {
                          setToolsOpen(false);
                          handleNavClick(module.href);
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{module.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <MobileNavLink href="#pricing" onClick={handleNavClick} isActive={false}>
              Pricing
            </MobileNavLink>
            <MobileNavLink href="#download" onClick={handleNavClick} isActive={false}>
              Download
            </MobileNavLink>
            
            <div className="pt-4 border-t border-purple-700/50">
              <Button
                variant="outline"
                className="w-full border-2 border-purple-400 text-purple-300 hover:bg-purple-400/10 hover:text-white hover:border-purple-300 bg-transparent"
                onClick={() => {
                  setMobileMenuOpen(false);
                  console.log('Login clicked');
                }}
              >
                Log In
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

interface NavLinkProps {
  href: string;
  onClick: (e: React.MouseEvent, href: string) => void;
  isActive: boolean;
  children: React.ReactNode;
}

function NavLink({ href, onClick, isActive, children }: NavLinkProps) {
  const linkHref = href.startsWith('#') ? `/${href}` : href;
  
  return (
    <Link
      href={linkHref}
      onClick={(e) => onClick(e, href)}
      className={`
        px-4 py-2 text-sm font-medium transition-colors h-full
        flex items-center cursor-pointer
        ${isActive 
          ? 'text-white border-b-2 border-yellow-400' 
          : 'text-gray-200 hover:text-white'
        }
      `}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, isActive, children }: NavLinkProps) {
  // For hash links, always use Link to handle navigation from other pages
  const linkHref = href.startsWith('#') ? `/${href}` : href;
  
  return (
    <Link
      href={linkHref}
      onClick={() => onClick(href)}
      className={`
        block px-4 py-2 text-sm font-medium transition-colors
        ${isActive 
          ? 'text-white bg-purple-800/50' 
          : 'text-gray-200 hover:text-white hover:bg-purple-800/30'
        }
      `}
    >
      {children}
    </Link>
  );
}
