import { NextResponse } from 'next/server'
import { kbArticles } from '@/lib/kb'
import { calculateSimilarity } from '@/lib/utils-ai'

export async function POST(request) {
  try {
    const { query } = await request.json()

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: 'query is required' },
        { status: 400 }
      )
    }

    // Step 1: Retrieval (Mock Vector Search using Jaccard similarity)
    const scoredArticles = kbArticles
      .map((article) => {
        const articleText =
          article.title + ' ' + article.content + ' ' + article.tags.join(' ')
        const score = calculateSimilarity(query, articleText)
        return {
          article,
          score,
        }
      })
      .sort((a, b) => b.score - a.score)

    // Filter for relevance threshold (lowered to 0.05 for better matching)
    const relevantArticles = scoredArticles
      .filter((a) => a.score > 0.05)
      .slice(0, 2)
      .map((a) => a.article)

    const topScore = scoredArticles[0]?.score || 0

    // Step 2: Generation (Mock LLM)
    let answer = ''
    if (relevantArticles.length > 0) {
      const context = relevantArticles[0]
      const queryLower = query.toLowerCase()

      // Generate answer based on query and context
      if (queryLower.includes('automation') || queryLower.includes('configure')) {
        answer = `Based on our knowledge base, you can configure automations in the Admin Panel. ${context.content}`
      } else if (queryLower.includes('csat') || queryLower.includes('visibility') || queryLower.includes('appearing') || queryLower.includes('not showing')) {
        answer = `Regarding CSAT visibility: ${context.content}`
      } else if (queryLower.includes('sla') || queryLower.includes('service level')) {
        answer = `Here's information about SLAs: ${context.content}`
      } else if (queryLower.includes('billing') || queryLower.includes('invoice')) {
        answer = `Regarding billing: ${context.content}`
      } else if (queryLower.includes('mailbox') || queryLower.includes('shared')) {
        answer = `About shared mailboxes: ${context.content}`
      } else if (queryLower.includes('merge') || queryLower.includes('mail merge')) {
        answer = `Regarding mail merge: ${context.content}`
      } else {
        answer = `Here is what I found: ${context.content}`
      }
    } else {
      answer =
        "I couldn't find any specific articles related to your query in the knowledge base. Could you try rephrasing?"
    }

    return NextResponse.json({
      query,
      answer,
      confidence: topScore,
      retrievedArticles: relevantArticles.map((a) => ({
        id: a.id,
        title: a.title,
        tags: a.tags,
      })),
      allScores: scoredArticles.map(({ article, score }) => ({
        articleId: article.id,
        articleTitle: article.title,
        score,
      })),
    })
  } catch (error) {
    console.error('RAG error:', error)
    return NextResponse.json(
      { error: 'Failed to process RAG query', details: error.message },
      { status: 500 }
    )
  }
}

