export const classesToString = (
  ...classes: (string | undefined | false | null)[]
): string => classes.filter(Boolean).join(' ')

export function cn(
  ...inputs: (string | Record<string, boolean> | undefined | false | null)[]
): string {
  const classes: string[] = []
  for (const input of inputs) {
    if (typeof input === 'string') {
      if (input) classes.push(input)
    } else if (typeof input === 'object' && input !== null) {
      Object.entries(input).forEach(([key, value]) => {
        if (value) classes.push(key)
      })
    }
  }
  return classes.join(' ')
}

export function formatMinutes(minutes: number): string {
  return minutes.toFixed(2)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}
