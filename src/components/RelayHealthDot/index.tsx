import useRelayHealth from '@/hooks/useRelayHealth'

export default function RelayHealthDot({ url, index }: { url: string; index: number }) {
  const { status, latencyMs } = useRelayHealth(url, index)

  return (
    <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <div
        className={`size-2 rounded-full ${
          status === 'checking'
            ? 'animate-pulse bg-muted-foreground'
            : status === 'online'
              ? 'bg-green-500'
              : 'bg-destructive'
        }`}
      />
      {status === 'online' && latencyMs !== undefined && (
        <span className="text-xs text-muted-foreground">{latencyMs}ms</span>
      )}
    </div>
  )
}
