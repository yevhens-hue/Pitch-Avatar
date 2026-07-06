'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { registerStonlyMessageListener } from '@/lib/stonly'
import { useSaraStore } from '@/widgets/Sara/store/useSaraStore'
import { useRouter } from 'next/navigation'

const SaraWidget = dynamic(() => import('@/widgets/Sara/ui/SaraWidgetContainer'), {
  ssr: false,
})


export default function ClientWidgets({ isLabMode }: { isLabMode: boolean }) {
  const { user } = useAuth()
  const router = useRouter()
  // Ref keeps userId always fresh inside closures (no stale closure problem)
  const userIdRef = useRef<string | undefined>(undefined)

  // Keep userIdRef always current whenever user changes
  useEffect(() => {
    userIdRef.current = user?.id
  }, [user])

  // Инициализация виджета с кастомными настройками (Пример)
  useEffect(() => {
    useSaraStore.getState().setConfig({
      avatarName: 'Sara Assistant',
      greetingMessage: 'Привет! Я Sara, ваш AI ассистент Pitch Avatar.\nЧем могу помочь сегодня?',
    })

    // Регистрация доступных инструментов (Tools / Function Calling) для LLM
    useSaraStore.getState().setTools([
      {
        type: "function",
        function: {
          name: "create_avatar",
          description: "Start the process of creating a new AI Chat Avatar project with a given name and role. Use ONLY when the user explicitly asks to create an AI avatar, chat avatar, or AI assistant.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Name for the avatar (e.g. Eva, John, Sales Bot)" },
              role: { type: "string", description: "Role of the avatar (e.g. HR, Sales Consultant, Support Agent)" }
            },
            required: ["name", "role"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_presentation",
          description: "Open the presentation creation wizard. Use when the user asks to create a presentation, project, pitch, or slide deck.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Optional title for the presentation" },
              type: { type: "string", enum: ["file", "video", "scratch"], description: "Type of presentation: upload file (file), video project (video), or start from scratch (scratch). Default: file" }
            },
            required: []
          }
        }
      }
    ]);

    // Регистрация глобального хендлера для Tool Calls (самый надёжный способ)
    (window as any).__PITCH_AVATAR_TOOL_HANDLER__ = async (tool: string, payload: Record<string, string>) => {
      console.log('🗣️ Sara Tool Handler called:', tool, payload);

      // Helper: call create-project API and redirect
      const createAndRedirect = async (type: string, extraPayload: any = {}) => {
        try {
          useSaraStore.getState().addMessage({
            id: Date.now(),
            role: 'assistant',
            content: `Creating your ${type === 'chat-avatar' ? 'AI avatar' : 'presentation'}...`,
            created_at: new Date().toISOString(),
          });

          // Read userId from ref — always current, no stale closure
          const userId = userIdRef.current;
          console.log('[Sara] userIdRef:', userId);

          if (!userId) {
            throw new Error('Not logged in — please refresh and try again');
          }

          const res = await fetch('/api/sara/create-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type,
              userId,
              ...extraPayload,
            }),
          });
          
          const result = await res.json();
          console.log('[Sara] create-project response:', res.status, result);

          if (res.ok && result.success && result.redirectUrl) {
            useSaraStore.getState().addMessage({
              id: Date.now() + 1,
              role: 'assistant',
              content: `✅ Done! "${result.title}" has been created. Opening it now...`,
              created_at: new Date().toISOString(),
            });
            setTimeout(() => router.push(result.redirectUrl), 800);
          } else {
            const errMsg = result.error || result.details || `HTTP ${res.status}`;
            throw new Error(errMsg);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error('[Sara] create-project failed:', msg);
          useSaraStore.getState().addMessage({
            id: Date.now() + 2,
            role: 'assistant',
            content: `Sorry, I couldn't create the project: ${msg}`,
            created_at: new Date().toISOString(),
          });
        }
      };

      if (tool === 'create_avatar') {
        await createAndRedirect('chat-avatar', { avatarName: payload.name, role: payload.role });
      } else if (tool === 'create_presentation') {
        await createAndRedirect(payload.type === 'video' ? 'video' : 'presentation', {
          title: payload.title || 'New Presentation',
        });
      }
    };

    // postMessage fallback (для iframe-сценария)
    const handleToolCall = (event: MessageEvent) => {
      if (event.data?.type === 'PITCH_AVATAR_TOOL_CALL') {
        const { tool, payload } = event.data;
        const handler = (window as any).__PITCH_AVATAR_TOOL_HANDLER__;
        if (typeof handler === 'function') {
          handler(tool, payload);
        }
      }
    };

    window.addEventListener('message', handleToolCall);
    return () => {
      window.removeEventListener('message', handleToolCall);
      delete (window as any).__PITCH_AVATAR_TOOL_HANDLER__;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).StonlyWidget && user) {
      const mainGoal = user.user_metadata?.main_goal || user.user_metadata?.goal || 'other';
      (window as any).StonlyWidget('identify', {
        userId: user.id,
        email: user.email,
        main_goal: mainGoal,
      });
    }
  }, [user])

  useEffect(() => {
    const cleanup = registerStonlyMessageListener(
      () => user?.id,
      () => user?.user_metadata?.main_goal || user?.user_metadata?.goal
    );
    return cleanup;
  }, [user])

  return (
    <>
      <SaraWidget />
    </>
  )
}
