'use client'

import { ChatShell } from "@/components/llm/ChatShell";
import { useChat } from '@/hooks/use-chat'

export function ChatPageClient() {
  const { messages, input, setInput, loading, sendMessage } = useChat()

  return (
    <ChatShell
      messages={messages}
      loading={loading}
      input={input}
      setInput={setInput}
      onSend={sendMessage}
    />
  )
}
