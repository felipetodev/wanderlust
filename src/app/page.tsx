import OpenAI from 'openai'
import Chat from './components/chat'
import { cookies } from 'next/headers'

export default async function AssistantPage () {
  console.log({ '🤩': process.env.OPENAI_API_KEY })
  const openai = new OpenAI()

  const threadId = cookies().get('threads')?.value
  console.log({ threadId: !!threadId })

  if (!threadId) return <Chat /> // return without previous messages

  const messages = await openai.beta.threads.messages.list(threadId, {
    order: 'asc'
  })

  return <Chat
    initialMessages={messages.data.map(({ id, role, content }) => ({
      id,
      role,
      // @ts-expect-error type later
      content: content[0]?.text?.value
    }))}
  />
}
