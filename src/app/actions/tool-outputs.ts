'use server'

import OpenAI from 'openai'
import { cookies } from 'next/headers'

export default async function submitToolOutputs ({ runId, toolCalls }: { runId: string, toolCalls: any }) {
  const openai = new OpenAI()

  const threadId = cookies().get('threads')?.value

  if (!threadId) {
    return { run: null, error: 'No thread found, please try again later' }
  }

  const run = await openai.beta.threads.runs.submitToolOutputs(
    threadId,
    runId,
    {
      tool_outputs: toolCalls.map((tc: any) => ({
        output: 'true',
        tool_call_id: tc.id
      }))
    }
  )

  return { run, error: null }
}
