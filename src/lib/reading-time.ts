/**
 * Estimate reading time for a long-form article's Markdown content.
 *
 * Strips Markdown / Nostr markup so formatting tokens don't inflate the
 * word count, then divides by a standard silent-reading rate of 200 WPM
 * and rounds up to the nearest whole minute (minimum 1).
 */
const WORDS_PER_MINUTE = 200

export function stripMarkdown(content: string): string {
  return (
    content
      // Fenced code blocks: keep inner text
      .replace(/```[\w-]*\n?([\s\S]*?)```/g, ' $1 ')
      // Inline code
      .replace(/`([^`]*)`/g, ' $1 ')
      // Images ![alt](url) — drop entirely
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      // Links [text](url) — keep the text
      .replace(/\[([^\]]*)\]\([^)]*\)/g, ' $1 ')
      // Reference-style links [text][ref]
      .replace(/\[([^\]]*)\]\[[^\]]*\]/g, ' $1 ')
      // nostr: bech32 references
      .replace(/nostr:[a-z0-9]+/gi, ' ')
      // Raw URLs
      .replace(/https?:\/\/\S+/g, ' ')
      // HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Headings (leading #)
      .replace(/^#{1,6}\s+/gm, ' ')
      // Blockquote markers
      .replace(/^>\s?/gm, ' ')
      // List markers
      .replace(/^\s*[-*+]\s+/gm, ' ')
      .replace(/^\s*\d+\.\s+/gm, ' ')
      // Horizontal rules
      .replace(/^\s*([-*_])\s*\1\s*\1[\s\S]*?$/gm, ' ')
      // Emphasis markers (**bold**, __bold__, *em*, _em_, ~~strike~~)
      .replace(/(\*\*|__|~~|[*_])/g, ' ')
      // Table pipes
      .replace(/\|/g, ' ')
      // Collapse whitespace
      .replace(/\s+/g, ' ')
      .trim()
  )
}

export function countWords(content: string): number {
  const stripped = stripMarkdown(content)
  if (!stripped) return 0
  // Split on any whitespace — works for Latin scripts. CJK content won't
  // split into "words" this way, but the spec explicitly leaves per-language
  // tuning out of scope.
  return stripped.split(/\s+/).filter(Boolean).length
}

export function estimateReadingMinutes(content: string): number {
  const words = countWords(content)
  if (words === 0) return 1
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
