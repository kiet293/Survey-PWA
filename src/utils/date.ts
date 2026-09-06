// Simple date formatting utility (no external lib needed)
export function format(date: Date, pattern: string = 'dd/MM/yyyy HH:mm'): string {
  const d = date.getDate().toString().padStart(2, '0')
  const M = (date.getMonth() + 1).toString().padStart(2, '0')
  const yyyy = date.getFullYear()
  const HH = date.getHours().toString().padStart(2, '0')
  const mm = date.getMinutes().toString().padStart(2, '0')

  return pattern
    .replace('dd', d)
    .replace('MM', M)
    .replace('yyyy', yyyy.toString())
    .replace('HH', HH)
    .replace('mm', mm)
}

export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy')
}

export function today(): string {
  return format(new Date(), 'yyyy-MM-dd')
    .split('/')
    .reverse()
    .join('-')
}

// Returns YYYY-MM-DD
export function toISODate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0')
  const M = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${date.getFullYear()}-${M}-${d}`
}
