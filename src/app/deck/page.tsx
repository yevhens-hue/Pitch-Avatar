import type { Metadata } from 'next'
import DeckPresentation from '@/components/Deck/DeckPresentation'

export const metadata: Metadata = {
  title: 'Итоги 1-го месяца · Pitch Avatar',
  description: 'CEO Update: Итоги онбординга и стратегия Retention',
}

export default function DeckPage() {
  return <DeckPresentation />
}
