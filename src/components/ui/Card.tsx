import React from 'react'
import styles from './Card.module.css'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export default function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div className={cn(styles.card, styles[`padding-${padding}`], className)}>
      {children}
    </div>
  )
}
