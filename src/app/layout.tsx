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
import { ToastProvider } from '@/components/ui/ToastProvider';

const isLabMode = process.env.NEXT_PUBLIC_LAB_MODE === 'true';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Global audio blocker — PERMANENTLY blocks TTS + Web Audio API */}
        <Script id="global-audio-blocker" strategy="beforeInteractive">
          {`(function() {
            var _patched = false;

            // Block HTMLMediaElement.play unless user-triggered via isTrusted click
            var _mediaAct = false;
            ['click','keydown','touchstart','pointerdown'].forEach(function(t) {
              document.addEventListener(t, function(e) {
                if (e.isTrusted) _mediaAct = true;
              }, { capture: true, passive: true });
            });
            var _origPlay = HTMLMediaElement.prototype.play;
            HTMLMediaElement.prototype.play = function() {
              if (!_mediaAct) {
                console.log('[AudioBlocker] media.play() blocked. src=' + this.src + '\\n', new Error().stack);
                this.muted = true;
                return Promise.resolve();
              }
              return _origPlay.apply(this, arguments);
            };

            // Block Web Audio API (AudioContext) — catches synthesized audio not using speechSynthesis
            var _OrigAudioContext = window.AudioContext || window.webkitAudioContext;
            if (_OrigAudioContext) {
              var _OrigResume = _OrigAudioContext.prototype.resume;
              _OrigAudioContext.prototype.resume = function() {
                if (!_mediaAct) {
                  console.log('[AudioBlocker] AudioContext.resume() blocked\\n', new Error().stack);
                  return Promise.resolve();
                }
                return _OrigResume.apply(this, arguments);
              };
            }

            // PERMANENTLY block speechSynthesis with non-writable override
            var _patchSS = function() {
              var ss = window.speechSynthesis;
              if (!ss || _patched) return;
              _patched = true;
              ss.cancel(); // stop anything pending right now
              var _blocked = function() {
                console.log('[AudioBlocker] speechSynthesis.speak() BLOCKED\\n', new Error().stack);
              };
              try {
                // Non-writable so nothing can override it
                Object.defineProperty(ss, 'speak', { value: _blocked, writable: false, configurable: false });
              } catch(e) {
                ss.speak = _blocked;
              }
            };

            _patchSS();
            document.addEventListener('DOMContentLoaded', _patchSS);
          })();`}
        </Script>

        <Script id="stonly-widget-config" strategy="beforeInteractive">
          {`window.STONLY_WID = "ddc35348-6c23-11ef-a9d4-06cb0cb2a85e";
            // Disable Stonly audio/TTS guides as early as possible
            window.STONLY_WIDGET_OPTIONS = { muted: true };`}
        </Script>
        <Script 
          id="stonly-widget-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `!function(s,t,o,n,l,y,w,g,d,e){s.StonlyWidget||((d=s.StonlyWidget=function(){
d._api?d._api.apply(d,arguments):d.queue.push(arguments)}).scriptPath=n,d.apiPath=l,d.sPath=y,d.queue=[],
(g=t.createElement(o)).async=!0,(e=new XMLHttpRequest).open("GET",n+"version?v="+Date.now(),!0),
e.onreadystatechange=function(){4===e.readyState&&(g.src=n+"stonly-widget.js?v="+
(200===e.status?e.responseText:Date.now()),(w=t.getElementsByTagName(o)[0]).parentNode.insertBefore(g,w))},e.send())
}(window,document,"script","https://stonly.com/js/widget/v2/");`
          }}
        />
      </head>

      <body style={{ margin: 0, padding: 0 }}>
        <PostHogProvider>
          <AuthProvider>
            <UserProvider>
              <ToastProvider>
                <ErrorBoundary>
                  <MainLayout>
                    {children}
                  </MainLayout>
                  <ClientWidgets isLabMode={isLabMode} />
                </ErrorBoundary>
              </ToastProvider>
            </UserProvider>
          </AuthProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
