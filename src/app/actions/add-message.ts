'use server'

import OpenAI from 'openai'
import { cookies } from 'next/headers'
import { type ThreadMessage } from 'openai/resources/beta/threads/messages/messages.mjs'

export default async function addMessage ({ content }: { content: string }): Promise<{ message: ThreadMessage | null, error: string | null }> {
  const openai = new OpenAI()

  const cookieStore = cookies()
  const hasCookie = cookieStore.has('threads')

  if (!hasCookie) {
    const thread = await openai.beta.threads.create({})
    cookies().set('threads', thread.id, { secure: true })
  }

  const threadId = cookies().get('threads')?.value

  if (!content) {
    return { message: null, error: 'No content found, please try again later' }
  }

  if (!threadId) {
    return { message: null, error: 'No thread found, please contact support' }
  }

  try {
    const message = await openai.beta.threads.messages.create(
      threadId,
      {
        role: 'user',
        content
      }
    )

    return { message, error: null }
  } catch (e) {
    // delete thread and cookie threadId
    await openai.beta.threads.del(threadId)
    cookies().delete('threads')

    console.error(e)

    return { message: null, error: 'Something went wrong adding message' }
  }
}
