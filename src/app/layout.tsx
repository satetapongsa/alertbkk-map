import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MIRRIX — Real-World Intelligence',
  description:
    'A live mirror of the real world, assembled from public geospatial, camera, traffic, weather, infrastructure, and incident data. Live global situational awareness.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#040608" />
      </head>
      <body>{children}</body>
    </html>
  );
}
