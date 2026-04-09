import { useEffect, useRef } from 'react'
import { ChatBubble } from './ChatBubble'
import type { Message } from '@/hooks/use-chat'

type ChatMessageListProps = {
  messages: Message[]
  loading: boolean
}

export function ChatMessageList({ messages, loading }: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="flex max-h-[min(60vh,520px)] min-h-[min(52vh,480px)] flex-col gap-3 overflow-y-auto px-4 py-4">
      {messages.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="font-display text-lg font-medium text-foreground">
            Ask the Pi anything
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Messages go through your local Ollama model on the Pi.
          </p>
        </div>
      )}
      {messages.map((m, i) => (
        <ChatBubble key={`msg-${i}`} message={m} />
      ))}
      {loading &&
        messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-border/80 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                PiBot is thinking…
              </span>
            </div>
          </div>
        )}
      <div ref={endRef} className="h-px shrink-0" aria-hidden />
    </div>
  )
}
