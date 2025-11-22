import { NextResponse } from 'next/server'
import { largeDataset } from '@/lib/data'

const PROMPT_V1 = `Analyze the sentiment of the following email. 
Return only Positive, Negative, or Neutral.`

const PROMPT_V2 = `You are a helpful customer support analyst. Analyze the sentiment of the email below.

Output Format: JSON
{
  "sentiment": "positive" | "negative" | "neutral",
  "confidence": <float between 0 and 1>,
  "reasoning": "<brief explanation of why>"
}

Rules:
- "Urgent" or "Frustrated" usually implies Negative.
- Feature requests are usually Neutral or Positive (if polite).
- Bug reports are Negative.
- Simple questions are Neutral.

Email:
`

function analyzeSentiment(emailText, useV2 = true) {
  const text = emailText.toLowerCase()

  let sentiment = 'neutral'
  let confidence = 0.7
  let reasoning = 'Standard query.'

  if (
    text.includes('unable') ||
    text.includes('error') ||
    text.includes('fail') ||
    text.includes('stuck') ||
    text.includes('not working') ||
    text.includes('missing') ||
    text.includes('disappeared')
  ) {
    sentiment = 'negative'
    confidence = 0.9
    reasoning = 'User is reporting a failure or inability to perform an action.'
  } else if (
    text.includes('help') ||
    text.includes('guide') ||
    text.includes('query') ||
    text.includes('need')
  ) {
    sentiment = 'neutral'
    confidence = 0.8
    reasoning = 'User is asking for information or assistance.'
  } else if (text.includes('feature') || text.includes('consider') || text.includes('request')) {
    sentiment = 'positive'
    confidence = 0.6
    reasoning = 'User is suggesting improvements constructively.'
  }

  if (useV2) {
    return {
      sentiment,
      confidence,
      reasoning,
    }
  } else {
    return sentiment.charAt(0).toUpperCase() + sentiment.slice(1)
  }
}

export async function POST(request) {
  try {
    const { promptVersion = 'v2', numEmails = 10 } = await request.json()

    const useV2 = promptVersion === 'v2'
    const emails = largeDataset.slice(0, Math.min(numEmails, largeDataset.length))

    const results = emails.map((email) => {
      const emailText = `${email.subject} ${email.body}`
      const output = analyzeSentiment(emailText, useV2)

      return {
        id: email.email_id,
        subject: email.subject,
        body: email.body,
        output,
      }
    })

    return NextResponse.json({
      promptVersion,
      prompt: useV2 ? PROMPT_V2 : PROMPT_V1,
      results,
      totalEmails: results.length,
    })
  } catch (error) {
    console.error('Sentiment analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze sentiment', details: error.message },
      { status: 500 }
    )
  }
}

