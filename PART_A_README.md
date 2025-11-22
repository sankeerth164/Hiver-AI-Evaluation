# Part A — Email Tagging Mini-System

## Overview
This document explains the implementation of a customer-specific email tagging system that classifies support emails using pattern-based heuristics while ensuring strict customer isolation.

---

## Approach

### Classification Strategy
The system uses a **pattern-matching baseline classifier** that analyzes email subject and body text to predict tags. The classifier employs keyword-based heuristics to identify common support email patterns.

### Architecture
1. **Data Isolation**: Each customer's emails are filtered and processed separately
2. **Tag Schema Isolation**: Only tags belonging to the selected customer are considered during classification
3. **Pattern Matching**: Keyword-based rules map email content to appropriate tags
4. **Confidence Scoring**: Each prediction includes a confidence score based on pattern match strength

---

## Model/Prompt

### Current Implementation: Pattern-Based Classifier
The classifier (`mockClassifyEmail` in `lib/utils-ai.js`) uses simple keyword matching:

```javascript
// Example patterns:
- "access", "permission", "login" → "access_issue" (confidence: 0.85)
- "rule", "workflow" → "workflow_issue" (confidence: 0.82)
- "billing", "invoice", "charged" → "billing" (confidence: 0.95)
- "csat" → "analytics_issue" (confidence: 0.88)
- "slow", "lag", "loading" → "performance" (confidence: 0.75)
```

### LLM-Based Alternative (For Production)
In a production system, this would be replaced with an LLM prompt:

```
You are an email classification system for customer support.

Customer: {customer_id}
Available Tags: {customer_specific_tags}

Email Subject: {subject}
Email Body: {body}

Classify this email into one of the available tags. 
Return JSON: {"tag": "...", "confidence": 0.0-1.0, "reasoning": "..."}

Only use tags from the provided list. Do not invent new tags.
```

---

## Customer Isolation

### Implementation Details

1. **Data Filtering**
   - Emails are filtered by `customer_id` before processing
   - Each customer sees only their own email dataset

2. **Tag Schema Isolation**
   ```javascript
   // Only customer-specific tags are extracted
   const customerTags = Array.from(new Set(
     customerEmails.map(e => e.tag)
   ))
   ```

3. **Classification Context**
   - The classifier receives only the customer's tag list
   - No cross-customer tag leakage occurs
   - Each customer's model operates in isolation

4. **UI Enforcement**
   - Customer selection dropdown restricts available data
   - Results are scoped to selected customer only
   - Switching customers resets classification results

### Why This Matters
- **Privacy**: Customer data remains isolated
- **Customization**: Each customer can have unique tag schemas
- **Accuracy**: Model doesn't confuse tags across customers
- **Compliance**: Meets data isolation requirements

---

## Error Analysis

### Common Misclassification Patterns

1. **Semantic Overlap**
   - `access_issue` vs `auth_issue` (both relate to login problems)
   - **Solution**: Implement semantic similarity checks or allow fuzzy matching for related tags

2. **Keyword Ambiguity**
   - "tag" can mean email tag or HTML tag
   - **Solution**: Use context-aware pattern matching or LLM understanding

3. **Low Confidence Fallbacks**
   - When no pattern matches, system falls back to first available tag
   - **Solution**: Implement confidence thresholds and human review for low-confidence predictions

4. **Missing Patterns**
   - New email types not covered by existing patterns
   - **Solution**: Continuous pattern learning and feedback loop

### Accuracy Metrics
- Current baseline accuracy varies by customer (typically 60-80%)
- Pattern-based approach works well for common issues
- Struggles with nuanced or multi-topic emails

---

## 3 Major Improvement Ideas for Production

### 1. **Hybrid LLM + Pattern Matching System**
**Approach**: Combine rule-based patterns with LLM reasoning
- **Pattern Layer**: Fast, deterministic rules for common cases (billing, access issues)
- **LLM Layer**: Handles complex, ambiguous cases
- **Benefits**: 
  - Speed for common cases
  - Intelligence for edge cases
  - Cost optimization (LLM only when needed)

**Implementation**:
```javascript
if (patternConfidence > 0.9) {
  return patternResult  // Fast path
} else {
  return await llmClassify(email, customerTags)  // Smart path
}
```

### 2. **Guardrails and Anti-Pattern Detection**
**Approach**: Implement validation rules that catch common mistakes
- **Contradiction Detection**: If email contains "urgent" but classified as "low_priority", flag for review
- **Negative Patterns**: If "billing" mentioned but tag is "technical_support", apply penalty
- **Confidence Thresholds**: Auto-escalate low-confidence predictions (<0.6) to human review

**Example Guardrails**:
```javascript
const guardrails = {
  "billing_mentioned": {
    invalidTags: ["technical_support", "feature_request"],
    action: "force_review"
  },
  "urgent_keywords": {
    invalidTags: ["low_priority"],
    action: "override_tag"
  }
}
```

### 3. **Continuous Learning with Feedback Loop**
**Approach**: Learn from corrections and improve over time
- **Feedback Collection**: Track when users correct tags
- **Pattern Mining**: Automatically discover new patterns from corrected examples
- **Model Retraining**: Periodically update pattern rules and LLM prompts based on feedback
- **A/B Testing**: Test new patterns on subset before full rollout

**Workflow**:
1. User corrects a tag → Store correction
2. Analyze correction → Extract new pattern
3. Validate pattern → Test on historical data
4. Deploy pattern → Monitor performance
5. Iterate based on results

---

## Technical Notes

### Current Limitations
- Pattern matching is simplistic and may miss context
- No learning from corrections
- Limited to predefined keyword patterns
- No handling of multi-label classification

### Future Enhancements
- Fine-tuned LLM per customer (if data volume allows)
- Embedding-based similarity for tag suggestions
- Multi-label support (emails can have multiple tags)
- Real-time pattern updates without redeployment

---

## Files
- **Component**: `components/part-a-tagging.jsx`
- **Classifier Logic**: `lib/utils-ai.js` → `mockClassifyEmail()`
- **Data**: `lib/data.js` → `largeDataset`

