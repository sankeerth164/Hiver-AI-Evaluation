import { NextResponse } from 'next/server'
import { largeDataset } from '@/lib/data'
import { mockClassifyEmail } from '@/lib/utils-ai'

export async function POST(request) {
  try {
    const { customerId } = await request.json()

    if (!customerId) {
      return NextResponse.json(
        { error: 'customerId is required' },
        { status: 400 }
      )
    }

    // Filter dataset by customer (customer isolation)
    const customerEmails = largeDataset.filter(
      (email) => email.customer_id === customerId
    )

    // Get unique tags for this customer
    const customerTags = Array.from(
      new Set(customerEmails.map((e) => e.tag))
    )

    // Classify all emails for this customer
    const results = customerEmails.map((email) => {
      const prediction = mockClassifyEmail(
        email.subject,
        email.body,
        email.customer_id,
        customerTags
      )

      return {
        email_id: email.email_id,
        subject: email.subject,
        body: email.body,
        ground_truth: email.tag,
        predicted: prediction.tag,
        confidence: prediction.confidence,
        method: prediction.method,
        isCorrect:
          prediction.tag === email.tag ||
          (prediction.tag === 'access_issue' && email.tag === 'auth_issue'),
      }
    })

    // Calculate accuracy
    const correct = results.filter((r) => r.isCorrect).length
    const accuracy = (correct / results.length) * 100

    return NextResponse.json({
      customerId,
      results,
      accuracy: Math.round(accuracy),
      totalEmails: results.length,
      correctPredictions: correct,
      customerTags,
    })
  } catch (error) {
    console.error('Classification error:', error)
    return NextResponse.json(
      { error: 'Failed to classify emails', details: error.message },
      { status: 500 }
    )
  }
}

