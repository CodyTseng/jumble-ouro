import { Check, Copy } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function CodeBlock({
  children,
  language
}: {
  children: React.ReactNode
  language?: string
}) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const preRef = useRef<HTMLPreElement>(null)

  const handleCopy = useCallback(() => {
    const text = preRef.current?.textContent ?? ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <div className="group/code relative">
      {language && (
        <div className="rounded-t-md bg-muted px-3 py-1 text-xs text-muted-foreground">
          {language}
        </div>
      )}
      <pre
        ref={preRef}
        className={`overflow-x-auto bg-muted p-3 text-sm ${language ? 'rounded-b-md' : 'rounded-md'}`}
      >
        {children}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        title={copied ? t('Copied') : t('Copy')}
        className="absolute right-2 top-2 rounded-md bg-muted-foreground/10 p-1 opacity-0 transition-opacity hover:bg-muted-foreground/20 group-hover/code:opacity-100 max-sm:opacity-100"
      >
        {copied ? (
          <Check className="size-4 text-green-500" />
        ) : (
          <Copy className="size-4 text-muted-foreground" />
        )}
      </button>
    </div>
  )
}
