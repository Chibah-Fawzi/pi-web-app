'use client'

import { useState } from 'react'

export type Message = {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

/** Proxied by Next to `pi-chat` (`POST /api/chat`). Override with absolute URL if needed. */
const API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL ?? '/api/chat'

type OllamaChatChunk = {
  message?: { content?: string }
  done?: boolean
}

function isNdjsonResponse(contentType: string) {
  const ct = contentType.toLowerCase()
  return ct.includes('ndjson') || ct.includes('application/x-ndjson')
}

async function* readOllamaNdjsonStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<string, void, undefined> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        let json: OllamaChatChunk
        try {
          json = JSON.parse(trimmed) as OllamaChatChunk
        } catch {
          continue
        }
        const delta = json.message?.content
        if (delta) yield delta
      }
    }
    const tail = buffer.trim()
    if (tail) {
      try {
        const json = JSON.parse(tail) as OllamaChatChunk
        const delta = json.message?.content
        if (delta) yield delta
      } catch {
        /* ignore */
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    const content = input.trim()
    if (!content || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
        }),
      })

      const contentType = resp.headers.get('content-type') || ''

      if (!resp.ok) {
        const data: unknown = await resp.json().catch(() => null)
        const err =
          data &&
          typeof data === 'object' &&
          'error' in data &&
          typeof (data as { error: unknown }).error === 'string'
            ? (data as { error: string }).error
            : 'request_failed'
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content:
              err === 'ollama_error'
                ? "Ollama n'a pas répondu — vérifie le modèle et le service."
                : "Erreur lors de l'appel au Pi 😅",
          },
        ])
        return
      }

      if (resp.body && isNdjsonResponse(contentType)) {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: '', streaming: true },
        ])

        let acc = ''
        for await (const delta of readOllamaNdjsonStream(resp.body)) {
          acc += delta
          setMessages([
            ...newMessages,
            { role: 'assistant', content: acc, streaming: true },
          ])
        }

        setMessages([
          ...newMessages,
          { role: 'assistant', content: acc, streaming: false },
        ])
        return
      }

      const data: unknown = await resp.json().catch(() => null)
      const payload = data as {
        message?: { content?: string }
        choices?: { message?: { content?: string } }[]
      }

      const answer =
        payload?.message?.content ||
        payload?.choices?.[0]?.message?.content ||
        'No answer'

      setMessages([...newMessages, { role: 'assistant', content: answer }])
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "Erreur lors de l'appel au Pi 😅",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return {
    messages,
    input,
    setInput,
    loading,
    sendMessage,
  }
}
