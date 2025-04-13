import type React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/auth-provider';

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <AuthProvider>
        <body className="overflow-hidden h-screen">{children}</body>
      </AuthProvider>
    </html>
  );
}
