import type { KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ChatComposerProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled: boolean
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  disabled,
  onKeyDown,
}: ChatComposerProps) {
  return (
    <div className="flex w-full gap-2">
      <Input
        placeholder="Ask something…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className="min-h-11 flex-1"
      />
      <Button
        type="button"
        size="icon"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        <Send className="size-4" />
      </Button>
    </div>
  )
}
