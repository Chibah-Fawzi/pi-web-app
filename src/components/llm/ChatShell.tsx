import type { KeyboardEvent } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import type { Message } from '@/hooks/use-chat'
import { ChatComposer } from './ChatComposer'
import { ChatHeader } from './ChatHeader'
import { ChatMessageList } from './ChatMessageList'

type ChatShellProps = {
  messages: Message[]
  loading: boolean
  input: string
  setInput: (value: string) => void
  onSend: () => void
}

export function ChatShell({
  messages,
  loading,
  input,
  setInput,
  onSend,
}: ChatShellProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6">
      <Card className="flex w-full max-w-2xl flex-col overflow-hidden">
        <ChatHeader />
        <CardContent className="min-h-0 flex-1 bg-background/30">
          <ChatMessageList messages={messages} loading={loading} />
        </CardContent>
        <CardFooter className="bg-muted/20">
          <ChatComposer
            value={input}
            onChange={setInput}
            onSend={onSend}
            disabled={loading}
            onKeyDown={handleKeyDown}
          />
        </CardFooter>
      </Card>
    </div>
  )
}
