import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerDeb } from '@electron-forge/maker-deb';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import path from 'path';

const config: ForgeConfig = {
  packagerConfig: {
    asar: false, // FFmpeg binaries cannot run from within ASAR
    name: 'HLS Starter',
    productName: 'HLS Starter',
    executableName: process.platform === 'win32' ? 'hls-starter' : 'HLS Starter',
    appBundleId: 'com.hlsstarter.desktop',
    
    // App icon configuration
    icon:
      process.platform === 'darwin'
        ? './assets/icons/icon.icns'
        : process.platform === 'win32'
          ? './assets/icons/icon.ico'
          : './assets/icons/512x512.png',
    
    // Include FFmpeg binaries as extra resources
    extraResource: [
      './resources/ffmpeg'
    ],
    
    // Protocol handlers
    protocols: [
      {
        name: 'HLS Starter',
        schemes: ['hls-starter'],
      },
    ],

    // macOS specific configuration
    ...(process.platform === 'darwin' && {
      osxSign: {
        identity: process.env.APPLE_IDENTITY,
        'hardened-runtime': true,
        entitlements: 'entitlements.plist',
        'entitlements-inherit': 'entitlements.plist',
        'signature-flags': 'library',
      },
      osxNotarize: process.env.APPLE_ID ? {
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_PASSWORD,
        teamId: process.env.APPLE_TEAM_ID,
      } : undefined,
    }),
  },
  
  rebuildConfig: {},
  
  makers: [
    // macOS DMG maker
    new MakerDMG({
      format: 'ULFO',
      name: 'HLS Starter',
    }, ['darwin']),
    
    // macOS ZIP maker (for direct download)
    new MakerZIP({}, ['darwin']),
    
    // Windows Squirrel installer
    new MakerSquirrel({
      name: 'hls_starter',
      authors: 'HLS Starter Team',
      description: 'Local FFmpeg video processing for HLS',
      setupIcon: './assets/icons/icon.ico',
      iconUrl: 'https://your-domain.com/icon.ico', // Update with actual URL
      loadingGif: './assets/icons/loading.gif', // Optional
      certificateFile: process.env.WINDOWS_CERTIFICATE_FILE,
      certificatePassword: process.env.WINDOWS_CERTIFICATE_PASSWORD,
    }, ['win32']),
    
    // Linux DEB maker
    new MakerDeb({
      options: {
        maintainer: 'HLS Starter Team',
        homepage: 'https://your-domain.com',
      },
    }, ['linux']),
  ],
  
  plugins: [
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false, // Set to false because we're using asar: false
      [FuseV1Options.OnlyLoadAppFromAsar]: false, // Set to false because we're using asar: false
    }),
  ],
};

export default config;
