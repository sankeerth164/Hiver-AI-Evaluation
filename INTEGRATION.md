# Integration Guide: Python Scripts and Web Application

This document explains how the standalone Python scripts integrate with the Next.js web application.

## ✅ Automatic Integration Complete

**All components now automatically use the API routes** when you run the frontend. The web page seamlessly works with the backend logic (which matches the Python scripts).

### How It Works

When you start the frontend (`npm run dev`):
1. **Components automatically call API routes**:
   - Part A → `/api/part-a/classify`
   - Part B → `/api/part-b/sentiment`
   - Part C → `/api/part-c/rag`

2. **API routes use the same logic** as Python scripts:
   - Same classification algorithms
   - Same sentiment analysis
   - Same RAG retrieval

3. **Fallback protection**:
   - If API fails, components fall back to client-side logic
   - No errors or broken pages
   - Everything works smoothly

---

## Architecture Overview

The project has **two implementations** of the same functionality:

1. **Web Application** (Next.js/JavaScript) - Interactive UI with automatic API integration
2. **Standalone Scripts** (Python) - Command-line runnable scripts

Both implementations use the same logic and produce equivalent results.

---

## Part A: Email Tagging

### Web Application
- **Component**: `components/part-a-tagging.jsx`
- **API Route**: `app/api/part-a/classify/route.js`
- **Logic**: `lib/utils-ai.js` → `mockClassifyEmail()`

### Standalone Script
- **File**: `part_a_email_tagging.py`
- **Run**: `python part_a_email_tagging.py`

### Integration
The web app uses the same classification logic as the Python script. Both:
- Filter emails by customer ID (isolation)
- Extract customer-specific tags
- Use pattern-based classification
- Calculate accuracy metrics

**API Usage**:
```javascript
// From frontend
const response = await fetch('/api/part-a/classify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ customerId: 'CUST_A' })
})
const data = await response.json()
```

---

## Part B: Sentiment Analysis

### Web Application
- **Component**: `components/part-b-sentiment.jsx`
- **API Route**: `app/api/part-b/sentiment/route.js`
- **Prompts**: Defined in component and API route

### Standalone Script
- **File**: `part_b_sentiment_analysis.py`
- **Run**: `python part_b_sentiment_analysis.py`

### Integration
Both implementations:
- Use the same two prompts (v1 and v2)
- Test on 10 emails
- Return sentiment, confidence, and reasoning (v2)

**API Usage**:
```javascript
// From frontend
const response = await fetch('/api/part-b/sentiment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    promptVersion: 'v2',  // or 'v1'
    numEmails: 10 
  })
})
const data = await response.json()
```

---

## Part C: Mini-RAG

### Web Application
- **Component**: `components/part-c-rag.jsx`
- **API Route**: `app/api/part-c/rag/route.js`
- **Logic**: `lib/utils-ai.js` → `calculateSimilarity()`

### Standalone Script
- **File**: `part_c_rag_system.py`
- **Run**: `python part_c_rag_system.py`

### Integration
Both implementations:
- Use Jaccard similarity for retrieval (mock embedding)
- Retrieve top 2 articles with threshold > 0.1
- Generate answers using template-based approach
- Return confidence scores

**API Usage**:
```javascript
// From frontend
const response = await fetch('/api/part-c/rag', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    query: 'How do I configure automations in Hiver?'
  })
})
const data = await response.json()
```

---

## Running the Scripts

### Option 1: Web Application (Recommended for Interactive Use)
```bash
npm run dev
# Open http://localhost:3000
```

### Option 2: Standalone Python Scripts (For CLI/Batch Processing)
```bash
# Part A
python part_a_email_tagging.py

# Part B
python part_b_sentiment_analysis.py

# Part C
python part_c_rag_system.py
```

---

## API Endpoints

All API routes are available at:
- `POST /api/part-a/classify` - Email classification
- `POST /api/part-b/sentiment` - Sentiment analysis
- `POST /api/part-c/rag` - RAG query processing

---

## Data Consistency

Both implementations use the same:
- **Email datasets**: `lib/data.js` (JS) / embedded in Python scripts
- **KB articles**: `lib/kb.js` (JS) / embedded in Python scripts
- **Classification logic**: Pattern matching rules
- **Similarity calculation**: Jaccard similarity

Results should be **identical** between web app and scripts.

---

## Future Integration Options

### Option 1: Call Python Scripts from Node.js
```javascript
import { exec } from 'child_process'

// In API route
exec('python part_a_email_tagging.py', (error, stdout, stderr) => {
  // Process output
})
```

### Option 2: Python Microservice
- Run Python scripts as separate services
- Call via HTTP from Next.js API routes
- Better for production scaling

### Option 3: Shared Logic Library
- Convert Python to JavaScript (already done)
- Or use a shared format (JSON configs)
- Both implementations read from same source

---

## User Experience

### What You See:
1. Click "Run Classification" → Calls API automatically
2. Click "Run Evaluation" → Calls API automatically
3. Ask a question → Calls API automatically

### What Happens Behind the Scenes:
```
User Action
    ↓
Component
    ↓
API Route (/api/part-*/...)
    ↓
Backend Logic (same as Python scripts)
    ↓
Results → Display in UI
```

## Notes

- The Python scripts are **standalone deliverables** as required by the assignment
- The web application provides an **interactive UI** for demonstration
- **Components automatically use API routes** - no manual configuration needed
- Both produce **equivalent results** using the same algorithms
- API routes allow the web app to use the same logic programmatically
- For production, replace mock algorithms with real LLM APIs and embeddings

## Summary

✅ **Frontend automatically uses backend API**
✅ **No manual steps needed**
✅ **No troubleshooting required**
✅ **Everything works seamlessly**
✅ **Same results as Python scripts**

**Just run `npm run dev` and everything works!** 🚀

