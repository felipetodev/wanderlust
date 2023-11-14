import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { StreamingTextResponse } from 'ai'

export const runtime = 'edge'

export async function GET (req: NextRequest) {
  // const { content } = await req.json()
  const openai = new OpenAI()

  const threadId = cookies().get('threads')?.value

  if (!threadId) {
    return NextResponse.json({ message: null, error: 'No thread found, please try again later' })
  }

  const messagesResp = await openai.beta.threads.messages.list(
    threadId
    // {
    //   order: 'asc'
    // }
  )

  const messages = messagesResp.data.map(({ id, role, content }) => ({
    id,
    role,
    // @ts-expect-error add-types
    content: content[0]?.text?.value
  }))

  const message = messages[0].content ?? 'Something went wrong fetching messages'
  console.log({ message })

  return new StreamingTextResponse(message)
}
