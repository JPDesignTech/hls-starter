'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DirectUpload } from '@/components/direct-upload';
import { ChunkedUpload } from '@/components/chunked-upload';
import { CloudUpload, Package, Server } from 'lucide-react';

type UploadMethod = 'direct' | 'chunked' | 'traditional';

export default function UploadDemoPage() {
  const [selectedMethod, setSelectedMethod] = useState<UploadMethod>('direct');

  const methods = [
    {
      id: 'direct' as UploadMethod,
      title: 'Direct to Cloud Storage',
      description: 'Upload directly to Google Cloud Storage, bypassing Vercel limits. Best for production.',
      icon: CloudUpload,
      component: DirectUpload,
    },
    {
      id: 'chunked' as UploadMethod,
      title: 'Chunked Upload',
      description: 'Split large files into smaller chunks. Works with local storage.',
      icon: Package,
      component: ChunkedUpload,
    },
    {
      id: 'traditional' as UploadMethod,
      title: 'Traditional Upload',
      description: 'Standard upload (limited to 4.5MB on Vercel).',
      icon: Server,
      component: null, // We'll show a warning for this
    },
  ];

  const SelectedComponent = methods.find(m => m.id === selectedMethod)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Video Upload Methods
          </h1>
          <p className="text-lg text-gray-300">
            Choose the upload method that works best for your setup
          </p>
        </div>

        {/* Method Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {methods.map((method) => {
            const Icon = method.icon;
            return (
              <Card
                key={method.id}
                className={`cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? 'bg-purple-600/20 border-purple-500'
                    : 'bg-white/10 border-white/20 hover:bg-white/20'
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <CardHeader>
                  <Icon className="h-8 w-8 text-purple-400 mb-2" />
                  <CardTitle className="text-white text-lg">
                    {method.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {method.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Upload Component */}
        <div className="mt-8">
          {SelectedComponent ? (
            <SelectedComponent />
          ) : (
            <Card className="bg-yellow-500/10 border-yellow-500/20">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-4">
                    Traditional Upload Warning
                  </h3>
                  <p className="text-gray-300 mb-6">
                    The traditional upload method is limited to 4.5MB on Vercel.
                    For larger files, please use one of the other methods.
                  </p>
                  <Button
                    onClick={() => setSelectedMethod('direct')}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Use Recommended Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Instructions */}
        <Card className="mt-8 bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            {selectedMethod === 'direct' && (
              <>
                <p>To use direct upload to Google Cloud Storage:</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Set up a Google Cloud Storage bucket</li>
                  <li>Create a service account with Storage Admin permissions</li>
                  <li>Add these environment variables to Vercel:
                    <code className="block mt-2 p-2 bg-black/50 rounded text-sm">
                      GCS_BUCKET_NAME=your-bucket-name<br />
                      GCP_PROJECT_ID=your-project-id
                    </code>
                  </li>
                  <li>Add the service account JSON key to Vercel</li>
                </ol>
              </>
            )}
            {selectedMethod === 'chunked' && (
              <>
                <p>Chunked upload works out of the box:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Files are split into 2MB chunks</li>
                  <li>Each chunk is uploaded sequentially</li>
                  <li>Server reassembles chunks into the original file</li>
                  <li>Works with Vercel's 4.5MB limit per request</li>
                </ul>
              </>
            )}
            {selectedMethod === 'traditional' && (
              <p className="text-yellow-400">
                ⚠️ Traditional upload will fail for files larger than 4.5MB on Vercel.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 