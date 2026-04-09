import { Bot } from 'lucide-react'
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function ChatHeader() {
  return (
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
          <Bot className="size-6" strokeWidth={1.75} />
        </div>
        <div className="text-left">
          <CardTitle>Pi LLM Chat</CardTitle>
          <CardDescription>Local Ollama · Raspberry Pi</CardDescription>
        </div>
      </div>
    </CardHeader>
  )
}
