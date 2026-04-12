import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pitch Avatar | Interactive AI Presentations',
  description: 'Create and distribute interactive presentations with AI avatars. Automate your sales follow-ups and marketing video content generation.',
  keywords: ['AI Avatar', 'Interactive Presentations', 'Sales Automation', 'RAG', 'Knowledge Base'],
};

import { AuthProvider } from '@/context/AuthContext';
import { UserProvider } from '@/context/UserProvider';
import MainLayout from '@/components/Layout/MainLayout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <AuthProvider>
          <UserProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
