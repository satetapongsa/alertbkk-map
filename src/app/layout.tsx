import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AlertBKK | Real-Time Bangkok Incident & Transit Map',
  description: 'Official real-time emergency, flood, traffic, accident monitoring and BTS/MRT transit intelligence network for Bangkok and metropolitan areas.',
  applicationName: 'AlertBKK Map',
  keywords: ['Bangkok', 'incident map', 'realtime traffic', 'flood warning', 'BTS status', 'MRT status', 'emergency alert Thailand'],
  authors: [{ name: 'AlertBKK Team' }],
  metadataBase: new URL('https://alertbkk.com'),
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/logo.svg' },
    ],
    shortcut: ['/logo.svg'],
  },
  openGraph: {
    title: 'AlertBKK | Real-Time Bangkok Incident & Transit Map',
    description: 'Official real-time emergency, flood, traffic, accident monitoring and BTS/MRT transit intelligence network.',
    url: 'https://alertbkk.com',
    siteName: 'AlertBKK Map',
    images: [
      {
        url: '/og-preview.jpg',
        width: 1200,
        height: 675,
        alt: 'AlertBKK Real-Time Incident Map Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlertBKK | Real-Time Bangkok Incident & Transit Map',
    description: 'Real-time emergency, flood, traffic, and BTS/MRT status monitoring across Bangkok.',
    images: ['/og-preview.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080c14',
};

import { PwaRegistration } from '@/components/common/PwaRegistration';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-[#080c14] text-[#f1f5f9] flex flex-col font-sans select-none">
        <PwaRegistration />
        {children}
      </body>
    </html>
  );
}
