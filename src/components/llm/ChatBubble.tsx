import { cn } from '@/lib/utils'
import type { Message } from '@/hooks/use-chat'

type ChatBubbleProps = {
  message: Message
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[min(85%,28rem)] rounded-2xl px-4 py-3 text-left text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'border border-border/80 bg-muted/50 text-foreground backdrop-blur-sm',
        )}
      >
        <div
          className={cn(
            'mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-80',
            isUser ? 'text-primary-foreground' : 'text-muted-foreground',
          )}
        >
          {isUser ? 'You' : 'PiBot'}
        </div>
        <div className="whitespace-pre-wrap break-words">
          {message.content}
          {message.role === 'assistant' && message.streaming && (
            <span
              className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-[-0.125em]"
              aria-hidden
            />
          )}
        </div>
      </div>
    </div>
  )
}
