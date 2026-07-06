'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { registerStonlyMessageListener } from '@/lib/stonly'
import { useSaraStore } from '@/widgets/Sara/store/useSaraStore'
import { useRouter } from 'next/navigation'
import { createProject } from '@/app/actions/projects'

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

      // Helper: call createProject server action and redirect
      const createAndRedirect = async (type: string, extraPayload: any = {}) => {
        try {
          useSaraStore.getState().addMessage({
            id: Date.now(),
            role: 'assistant',
            content: `Creating your ${type === 'chat-avatar' ? 'AI avatar' : 'presentation'}...`,
            created_at: new Date().toISOString(),
          });

          // Call server action directly
          const project = await createProject({
            title: extraPayload.title || (type === 'chat-avatar' ? `${extraPayload.avatarName || 'AI Avatar'} (Chat Avatar)` : 'New Presentation'),
            type: type === 'chat-avatar' ? 'presentation' : (type === 'video' ? 'video' : 'presentation'),
            status: 'active',
            userId: user?.id,
            isCoachMode: false,
            traineeRole: type === 'chat-avatar' ? extraPayload.role : undefined,
          });

          if (project && project.id) {
            useSaraStore.getState().addMessage({
              id: Date.now() + 1,
              role: 'assistant',
              content: `✅ Done! "${project.title}" has been created. Opening it now...`,
              created_at: new Date().toISOString(),
            });

            const redirectUrl = type === 'chat-avatar'
              ? `/chat-avatar/create?projectId=${project.id}&name=${encodeURIComponent(extraPayload.avatarName || '')}&role=${encodeURIComponent(extraPayload.role || '')}`
              : `/editor?projectId=${project.id}`;
            
            setTimeout(() => router.push(redirectUrl), 800);
          } else {
            throw new Error('Project ID not returned');
          }
        } catch (err) {
          console.error('[Sara] create-project failed:', err);
          useSaraStore.getState().addMessage({
            id: Date.now() + 2,
            role: 'assistant',
            content: `Sorry, I couldn't create the project. Please try manually via "Create Project" button.`,
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
