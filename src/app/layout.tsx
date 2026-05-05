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
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import Script from 'next/script';
import { PostHogProvider } from '@/components/Providers/PostHogProvider';
import ClientWidgets from '@/components/Layout/ClientWidgets';

const isLabMode = process.env.NEXT_PUBLIC_LAB_MODE === 'true';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Stonly is disabled in lab mode — the custom WelcomeGuide is used instead */}
        {!isLabMode && (
          <>
            <Script id="stonly-widget-config" strategy="beforeInteractive">
              {`window.STONLY_WID = "ddc35348-6c23-11ef-a9d4-06cb0cb2a85e";`}
            </Script>
            <Script
              id="stonly-widget-script"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: `!function(s,t,o,n,l,y,w,g,d,e){s.StonlyWidget||((d=s.StonlyWidget=function(){
d._api?d._api.apply(d,arguments):d.queue.push(arguments)}).scriptPath=n,d.apiPath=l,d.sPath=y,d.queue=[],
(g=t.createElement(o)).async=!0,(e=new XMLHttpRequest).open("GET",n+"version?v="+Date.now(),!0),
e.onreadystatechange=function(){4===e.readyState&&(g.src=n+"stonly-widget.js?v="+
(200===e.status?e.responseText:Date.now()),(w=t.getElementsByTagName(o)[0]).parentNode.insertBefore(g,w))},e.send());
window.openStonlyGuide = function(id) {
  var targetId = id || "NGxoMErklJ";
  if (window.StonlyWidget) {
    window.StonlyWidget("openGuide", { guideId: targetId });
  }
};
}(window,document,"script","https://stonly.com/js/widget/v2/");`
              }}
            />
          </>
        )}
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <PostHogProvider>
          <AuthProvider>
            <UserProvider>
              <ErrorBoundary>
                <MainLayout>
                  {children}
                </MainLayout>
                <ClientWidgets isLabMode={isLabMode} />
              </ErrorBoundary>
            </UserProvider>
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
