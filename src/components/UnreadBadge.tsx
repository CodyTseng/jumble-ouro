export default function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null

  return (
    <div className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-background">
      {count >= 10 ? '9+' : count}
    </div>
  )
}
