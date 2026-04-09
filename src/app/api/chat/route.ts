import { NextRequest, NextResponse } from 'next/server'

/**
 * Base URL of the Express `pi-chat` server (no trailing path).
 * @example http://127.0.0.1:3001
 */
const PI_CHAT_BASE =
  process.env.PI_CHAT_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:3001'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const upstream = await fetch(`${PI_CHAT_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!upstream.ok) {
    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        'Content-Type':
          upstream.headers.get('content-type') || 'application/json',
      },
    })
  }

  const ct = upstream.headers.get('content-type') || ''
  if (ct.includes('ndjson') || ct.includes('x-ndjson')) {
    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    })
  }

  const data = await upstream.json()
  return NextResponse.json(data)
}
