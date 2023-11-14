'use server'

import OpenAI from 'openai'
import { cookies } from 'next/headers'
import { type RunAction } from '../lib/types'

const assistantID = 'asst_4Gvk7WJuvcSqPuzUciiGSw8j'

export default async function runAssistant (): Promise<RunAction> {
  const openai = new OpenAI()

  const threadId = cookies().get('threads')?.value

  if (!threadId) {
    return { run: null, error: 'No thread found, please try again later' }
  }

  const run = await openai.beta.threads.runs.create(
    threadId,
    {
      assistant_id: assistantID
    }
  )

  return { run, error: null }
}
