'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { registerStonlyMessageListener } from '@/lib/stonly'
import { useSaraStore } from '@/widgets/Sara/store/useSaraStore'

const SaraWidget = dynamic(() => import('@/widgets/Sara/ui/SaraWidgetContainer'), {
  ssr: false,
})


export default function ClientWidgets({ isLabMode }: { isLabMode: boolean }) {
  const { user } = useAuth()

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
          description: "Начать процесс создания нового AI-аватара (проекта) с заданным именем и ролью.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Имя будущего аватара" },
              role: { type: "string", description: "Роль аватара (например: HR, Продажи, Консультант)" }
            },
            required: ["name", "role"]
          }
        }
      }
    ]);

    // Обработчик выполнения команд от Сары
    const handleToolCall = (event: MessageEvent) => {
      if (event.data?.type === 'PITCH_AVATAR_TOOL_CALL') {
        const { tool, payload } = event.data;
        if (tool === 'create_avatar') {
          console.log('🗣️ Sara triggers avatar creation:', payload);
          // Здесь мы можем делать redirect или открывать модалку
          // Пример: router.push(`/projects/new?name=${payload.name}&role=${payload.role}`)
          alert(`Sara: Создаю аватара "${payload.name}" с ролью "${payload.role}"!`);
        }
      }
    };

    window.addEventListener('message', handleToolCall);
    return () => window.removeEventListener('message', handleToolCall);
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
