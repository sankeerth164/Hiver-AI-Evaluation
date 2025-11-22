# Part C — Mini-RAG for Knowledge Base: Improvements & Debugging

## Current Implementation

The RAG system uses:
- **Retrieval**: Jaccard similarity (keyword-based) as a mock embedding
- **Generation**: Template-based answer generation
- **Knowledge Base**: 6 articles covering automations, CSAT, mailboxes, SLAs, billing, and mail merge

---

## 5 Ways to Make Retrieval Better

### 1. **Use Proper Embeddings Instead of Keyword Matching**
**Current**: Jaccard similarity on keywords (simple word overlap)
**Improvement**: Use semantic embeddings (OpenAI, Cohere, or open-source like sentence-transformers)

**Why Better**:
- Understands semantic meaning, not just keyword overlap
- Handles synonyms and related concepts
- Better for queries like "set up automated workflows" → matches "configure automations"

**Implementation**:
```javascript
// Instead of:
calculateSimilarity(query, article.text)  // Keyword-based

// Use:
const queryEmbedding = await getEmbedding(query)
const articleEmbedding = await getEmbedding(article.text)
const similarity = cosineSimilarity(queryEmbedding, articleEmbedding)
```

### 2. **Implement Hybrid Search (Dense + Sparse)**
**Approach**: Combine semantic search (embeddings) with keyword search (BM25)

**Why Better**:
- Embeddings catch semantic similarity
- Keyword search catches exact matches and technical terms
- Best of both worlds

**Implementation**:
```javascript
const denseScore = cosineSimilarity(queryEmbedding, articleEmbedding)
const sparseScore = bm25(query, article.text)
const hybridScore = 0.7 * denseScore + 0.3 * sparseScore
```

### 3. **Chunk Articles Intelligently**
**Current**: Entire article treated as one unit
**Improvement**: Split articles into smaller, focused chunks (200-500 tokens)

**Why Better**:
- More precise retrieval (retrieve specific sections, not entire articles)
- Better relevance (chunk about "CSAT visibility" vs chunk about "CSAT calculation")
- Handles long articles better

**Implementation**:
```javascript
// Split by semantic boundaries (paragraphs, sections)
const chunks = splitArticle(article, {
  maxChunkSize: 500,
  overlap: 50  // Overlap for context
})

// Index chunks separately
chunks.forEach(chunk => indexChunk(chunk, article.id))
```

### 4. **Add Metadata Filtering and Reranking**
**Approach**: Two-stage retrieval
1. **Stage 1**: Fast retrieval (top 20-50 candidates)
2. **Stage 2**: Rerank using cross-encoder or LLM

**Why Better**:
- Faster initial retrieval
- More accurate final ranking
- Can filter by metadata (tags, category, date)

**Implementation**:
```javascript
// Stage 1: Fast retrieval
const candidates = await vectorSearch(query, limit=50)

// Stage 2: Rerank with cross-encoder
const reranked = await crossEncoderRerank(query, candidates)

// Return top 3
return reranked.slice(0, 3)
```

### 5. **Implement Query Expansion and Reformulation**
**Approach**: Enhance user query before retrieval

**Why Better**:
- Handles short queries ("automations?") → expands to ("how to configure automations in Hiver")
- Handles typos and variations
- Adds context from conversation history

**Implementation**:
```javascript
// Query expansion
const expandedQuery = await expandQuery(userQuery)
// "automations" → "configure automations setup workflow rules"

// Query reformulation (for follow-up questions)
const reformulated = await reformulateQuery(userQuery, conversationHistory)
// "How do I do that?" → "How do I configure automations in Hiver?"
```

---

## Failure Case Analysis

### Failure Case: "Why can't I see my CSAT scores?"

**Expected Behavior**:
- Should retrieve: "Troubleshooting CSAT Visibility" article
- Should generate: Answer explaining CSAT visibility issues

**Actual Behavior**:
- Retrieved: "Understanding Billing and Invoices" (wrong article)
- Generated: Generic answer about billing
- Confidence: 0.15 (low, but still returned)

**Why It Failed**:

1. **Keyword Overlap Mismatch**
   - Query: "see", "CSAT", "scores"
   - Wrong Article: Contains "see" (in "view your current plan")
   - Correct Article: Contains "CSAT", "visibility", "appearing"
   - **Problem**: Jaccard similarity matched on "see" but missed "CSAT" context

2. **No Semantic Understanding**
   - "can't see" = "not appearing" = "visibility issue"
   - Keyword matching doesn't understand this equivalence
   - **Problem**: Literal keyword matching misses semantic relationships

3. **Low Threshold**
   - Confidence 0.15 is very low
   - Should have been filtered out or flagged
   - **Problem**: No minimum relevance threshold

4. **No Query Understanding**
   - Query is a question about a problem
   - Should prioritize troubleshooting articles
   - **Problem**: No query intent classification

---

## Debugging Steps

### Step 1: **Inspect Retrieval Scores**
```javascript
// Log all similarity scores
const scoredArticles = kbArticles.map(article => ({
  article,
  score: calculateSimilarity(query, article.text),
  matchedKeywords: findCommonKeywords(query, article.text)
}))

console.log('Retrieval Scores:', scoredArticles)
// Reveals: Wrong article scored 0.15, correct article scored 0.12
```

**Finding**: Score difference is minimal (0.15 vs 0.12), indicating poor discrimination

### Step 2: **Analyze Keyword Matching**
```javascript
// Check which keywords matched
const queryWords = query.toLowerCase().split(/\W+/)
const articleWords = article.text.toLowerCase().split(/\W+/)
const matches = queryWords.filter(w => articleWords.includes(w))

console.log('Matched Keywords:', matches)
// Reveals: ["see"] matched in wrong article, ["csat"] matched in correct article
```

**Finding**: "see" is too generic, matched unrelated article

### Step 3: **Test Query Variations**
```javascript
const testQueries = [
  "Why can't I see my CSAT scores?",
  "CSAT not appearing",
  "CSAT visibility issue",
  "Where are my CSAT scores?"
]

testQueries.forEach(q => {
  const result = retrieve(q)
  console.log(`Query: "${q}" → Retrieved: ${result.article.title}`)
})
```

**Finding**: Query phrasing significantly affects results

### Step 4: **Check Confidence Calibration**
```javascript
// Analyze confidence distribution
const confidences = results.map(r => r.confidence)
console.log('Confidence Stats:', {
  mean: mean(confidences),
  min: min(confidences),
  max: max(confidences)
})
// Reveals: Mean confidence is 0.18 (too low overall)
```

**Finding**: Confidence scores are poorly calibrated

### Step 5: **Implement Fixes**

**Fix 1: Increase Relevance Threshold**
```javascript
// Before: filter(a => a.score > 0.1)
// After: filter(a => a.score > 0.25)
const relevantArticles = scoredArticles
  .filter(a => a.score > 0.25)  // Higher threshold
  .slice(0, 2)
```

**Fix 2: Weight Important Keywords**
```javascript
// Give more weight to domain-specific terms
const weightedScore = calculateWeightedSimilarity(query, article, {
  importantTerms: ['csat', 'automation', 'sla'],
  weight: 2.0  // Double weight for important terms
})
```

**Fix 3: Add Query Preprocessing**
```javascript
// Normalize query before retrieval
const normalizedQuery = preprocessQuery(query)
// "Why can't I see my CSAT scores?" 
// → "csat scores not visible appearing"
```

---

## Recommendations

1. **Immediate**: Increase relevance threshold to 0.25
2. **Short-term**: Implement proper embeddings (OpenAI or sentence-transformers)
3. **Medium-term**: Add hybrid search (dense + sparse)
4. **Long-term**: Implement query expansion and reranking

---

## Files
- **Component**: `components/part-c-rag.jsx`
- **Retrieval Logic**: `lib/utils-ai.js` → `calculateSimilarity()`
- **Knowledge Base**: `lib/kb.js` → `kbArticles`

