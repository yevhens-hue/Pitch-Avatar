'use client'

import { useParams, useRouter } from 'next/navigation'
import LinkAnalyticsDetail from '@/components/Analytics/LinkAnalyticsDetail'

export default function AnalyticsDetailPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''
  return <LinkAnalyticsDetail id={id} />
}
