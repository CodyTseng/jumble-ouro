import { cn } from '@/lib/utils'

export default function NoteKindLabel({
  label,
  className
}: {
  label: string
  className?: string
}) {
  return <div className={cn('text-xs text-muted-foreground', className)}>{label}</div>
}
