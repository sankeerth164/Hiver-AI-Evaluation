import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Simple Jaccard Similarity for keyword matching (Mock Embedding)
export function calculateSimilarity(text1, text2) {
  const queryLower = text1.toLowerCase().trim()
  const articleLower = text2.toLowerCase().trim()

  // Direct keyword matching boost (high priority)
  const importantKeywords = [
    { keywords: ['csat', 'customer satisfaction'], boost: 0.5 },
    { keywords: ['automation', 'automate', 'configure'], boost: 0.5 },
    { keywords: ['sla', 'service level'], boost: 0.4 },
    { keywords: ['billing', 'invoice', 'charge'], boost: 0.4 },
    { keywords: ['mailbox', 'mail box', 'shared'], boost: 0.4 },
    { keywords: ['merge', 'mail merge'], boost: 0.4 },
    { keywords: ['visibility', 'appearing', 'showing', 'not visible', 'not appearing'], boost: 0.3 },
    { keywords: ['setup', 'configure', 'setting'], boost: 0.3 },
  ]

  let keywordBoost = 0
  for (const { keywords, boost } of importantKeywords) {
    const queryHasKeyword = keywords.some(k => queryLower.includes(k))
    const articleHasKeyword = keywords.some(k => articleLower.includes(k))
    if (queryHasKeyword && articleHasKeyword) {
      keywordBoost += boost
    }
  }

  // If we have a strong keyword match, return high score
  if (keywordBoost >= 0.4) {
    return Math.min(1, 0.6 + keywordBoost * 0.4)
  }

  // Normalize and tokenize - keep words of length >= 2
  const normalize = (text) => {
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length >= 2)
      .filter((w) => !['is', 'are', 'the', 'a', 'an', 'and', 'or', 'but', 'to', 'of', 'in', 'on', 'at', 'for', 'with'].includes(w))
  }

  const words1 = normalize(text1)
  const words2 = normalize(text2)

  // If query is too short after filtering, use substring matching
  if (words1.length === 0) {
    // For very short queries like "hi", check if any important word from article matches
    return keywordBoost > 0 ? 0.3 : 0
  }

  // Create sets for Jaccard similarity
  const set1 = new Set(words1)
  const set2 = new Set(words2)

  // Calculate intersection and union
  const intersection = new Set([...set1].filter((x) => set2.has(x)))
  const union = new Set([...set1, ...set2])

  // Jaccard similarity
  if (union.size === 0) return keywordBoost

  const jaccard = intersection.size / union.size

  // Combine Jaccard with keyword boost
  return Math.min(1, jaccard + keywordBoost)
}

// Mock Classifier Logic for Part A
export function mockClassifyEmail(
  subject,
  body,
  customerId,
  knownTags,
) {
  const text = `${subject} ${body}`.toLowerCase()

  // Simple keyword heuristics based on the dataset patterns
  if (text.includes("access") || text.includes("permission") || text.includes("login"))
    return { tag: "access_issue", confidence: 0.85, method: "Pattern Match" }
  if (text.includes("rule") || text.includes("workflow"))
    return { tag: "workflow_issue", confidence: 0.82, method: "Pattern Match" }
  if (text.includes("tag")) return { tag: "tagging_issue", confidence: 0.78, method: "Pattern Match" }
  if (text.includes("billing") || text.includes("invoice") || text.includes("charged"))
    return { tag: "billing", confidence: 0.95, method: "Pattern Match" }
  if (text.includes("csat")) return { tag: "analytics_issue", confidence: 0.88, method: "Pattern Match" }
  if (text.includes("slow") || text.includes("lag") || text.includes("loading"))
    return { tag: "performance", confidence: 0.75, method: "Pattern Match" }
  if (text.includes("sla")) return { tag: "setup_help", confidence: 0.65, method: "Pattern Match" }
  if (text.includes("dark mode") || text.includes("feature"))
    return { tag: "feature_request", confidence: 0.9, method: "Pattern Match" }

  // Fallback to most common tag for customer if available, or generic
  return { tag: knownTags[0] || "general_inquiry", confidence: 0.4, method: "Fallback" }
}

