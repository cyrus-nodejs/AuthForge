// src/app/layout.tsx

import type { Metadata } from 'next';

import { AuthProvider } from '@/modules/auth/providers/auth-provider';
import { SessionExpiryHandler } from '@/modules/auth/components/session-expiry-handler';

import './globals.css';

export const metadata: Metadata = {
  title: 'AuthFort',
  description: 'Passwordless authentication',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SessionExpiryHandler />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
