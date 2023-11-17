import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

export const runtime = 'edge'

export async function POST (req: NextRequest) {
  const formData = await req.formData()
  const filePDF = formData.get('file') as unknown as File

  if (!filePDF) {
    return NextResponse.json({ error: 'No file found, please try again later' })
  }

  const openai = new OpenAI()

  const cookieStore = cookies()
  const hasCookie = cookieStore.has('threads')

  if (!hasCookie) {
    const thread = await openai.beta.threads.create({})
    cookieStore.set('threads', thread.id, { secure: true })
  }

  const threadId = cookieStore.get('threads')?.value

  if (!threadId) {
    return NextResponse.json({ error: 'No thread found, please try again later' }, { status: 500 })
  }

  try {
    const file = await openai.files.create({
      file: filePDF,
      purpose: 'assistants'
    })

    const message = await openai.beta.threads.messages.create(
      threadId,
      {
        file_ids: [file.id],
        role: 'user',
        content: 'Briefly summarize the content of this file, if it contains information about a flight ticket or tickets, booking code, passenger type, itinerary, flight number, etc. Consider using trigger "flight_info" function to populate the flight information to the user.'
      }
    )

    return NextResponse.json(message)
  } catch (e) {
    // delete thread and cookie threadId
    await openai.beta.threads.del(threadId)
    cookies().delete('threads')

    console.error(e)

    return NextResponse.json({ error: 'Something went wrong adding message' }, { status: 500 })
  }
}
