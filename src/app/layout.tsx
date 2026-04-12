import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pitch Avatar | Interactive AI Presentations',
  description: 'Create and distribute interactive presentations with AI avatars. Automate your sales follow-ups and marketing video content generation.',
  keywords: ['AI Avatar', 'Interactive Presentations', 'Sales Automation', 'RAG', 'Knowledge Base'],
};

import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
