'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
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

  // Инициализация виджета с кастомными настройками (Пример)
  useEffect(() => {
    useSaraStore.getState().setConfig({
      avatarName: 'Sara Assistant',
      // Пример: Замена фото аватара на кастомное (можно использовать внешний URL)
      // avatarImageUrl: 'https://cdn-icons-png.flaticon.com/512/4712/4712010.png',
      // Пример: Замена приветственного сообщения
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
    (window as any).__PITCH_AVATAR_TOOL_HANDLER__ = (tool: string, payload: Record<string, string>) => {
      console.log('🗣️ Sara Tool Handler called:', tool, payload);
      if (tool === 'create_avatar') {
        const params = new URLSearchParams();
        if (payload.name) params.append('name', payload.name);
        if (payload.role) params.append('role', payload.role);
        router.push(`/chat-avatar/create?${params.toString()}`);
      } else if (tool === 'create_presentation') {
        const tab = payload.type || 'file';
        const params = new URLSearchParams();
        params.append('openModal', 'true');
        params.append('tab', tab);
        if (payload.title) params.append('title', payload.title);
        router.push(`/projects?${params.toString()}`);
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
  }, [])

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
