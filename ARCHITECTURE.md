# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface (Browser)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Part A:     │  │  Part B:     │  │  Part C:     │   │
│  │  Tagging     │  │  Sentiment   │  │  RAG System  │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                  │            │
└─────────┼─────────────────┼──────────────────┼────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js API Routes (Server)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ /api/part-a/ │  │ /api/part-b/ │  │ /api/part-c/ │   │
│  │  classify    │  │  sentiment   │  │  rag         │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
└─────────┼─────────────────┼──────────────────┼────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Core Logic (lib/utils-ai.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ mockClassify │  │ analyzeSent- │  │ calculateSim- │   │
│  │ Email()      │  │ iment()      │  │ ilarity()     │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
└─────────┼─────────────────┼──────────────────┼────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Sources                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ lib/data.js  │  │ lib/data.js  │  │ lib/kb.js    │   │
│  │ (Emails)     │  │ (Emails)     │  │ (KB Articles)│   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Flow: Part A (Email Tagging)

```
User selects customer (CUST_A)
         │
         ▼
Filter emails by customer_id
         │
         ▼
Extract customer-specific tags
         │
         ▼
For each email:
  ┌─────────────────────┐
  │ mockClassifyEmail() │
  │ - Pattern matching  │
  │ - Confidence score  │
  └──────────┬──────────┘
         │
         ▼
Compare prediction vs ground truth
         │
         ▼
Calculate accuracy metrics
         │
         ▼
Display results in UI
```

## Component Flow: Part B (Sentiment Analysis)

```
User clicks "Run Evaluation"
         │
         ▼
Select prompt version (v1 or v2)
         │
         ▼
For each email:
  ┌─────────────────────┐
  │ analyzeSentiment()   │
  │ - Keyword analysis   │
  │ - Confidence score  │
  │ - Reasoning (v2)    │
  └──────────┬──────────┘
         │
         ▼
Compare results side-by-side
         │
         ▼
Display evaluation metrics
```

## Component Flow: Part C (RAG System)

```
User enters query
         │
         ▼
┌─────────────────────┐
│ Retrieval Stage     │
│ - calculateSimilarity() │
│ - Score all articles│
│ - Filter by threshold│
│ - Top 2 articles   │
└──────────┬──────────┘
         │
         ▼
┌─────────────────────┐
│ Generation Stage    │
│ - Extract context   │
│ - Template-based    │
│ - Generate answer   │
└──────────┬──────────┘
         │
         ▼
Display answer with:
- Confidence score
- Source articles
- All scores
```

## Data Isolation Architecture (Part A)

```
┌─────────────────────────────────────┐
│      All Customer Data              │
│  ┌─────────┐  ┌─────────┐  ┌──────┐ │
│  │ CUST_A  │  │ CUST_B  │  │ ...  │ │
│  └────┬────┘  └────┬────┘  └──────┘ │
└───────┼────────────┼────────────────┘
        │            │
        │            │
        ▼            ▼
┌─────────────┐  ┌─────────────┐
│ CUST_A Only │  │ CUST_B Only │
│ - Emails    │  │ - Emails    │
│ - Tags:     │  │ - Tags:     │
│   - billing │  │   - support │
│   - access  │  │   - feature │
└─────────────┘  └─────────────┘
        │            │
        │            │
        ▼            ▼
  Classification  Classification
  (isolated)      (isolated)
```

## Deployment Architecture

```
┌─────────────────────────────────────┐
│         Vercel Platform             │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Next.js Application        │ │
│  │                               │ │
│  │  ┌──────────┐  ┌──────────┐ │ │
│  │  │ Frontend │  │ API      │ │ │
│  │  │ (React)  │  │ Routes   │ │ │
│  │  └────┬─────┘  └────┬─────┘ │ │
│  │       │             │        │ │
│  │       └──────┬──────┘        │ │
│  │              │               │ │
│  │       ┌──────▼──────┐        │ │
│  │       │ Core Logic  │        │ │
│  │       │ (utils-ai)  │        │ │
│  │       └─────────────┘        │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
              │
              │ HTTPS
              ▼
    ┌─────────────────┐
    │   User Browser   │
    │  (Interactive UI)│
    └─────────────────┘
```

## Standalone Scripts Architecture

```
┌─────────────────────────────────────┐
│   Python Scripts (Standalone)      │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │ part_a_  │  │ part_b_  │       │
│  │ email_   │  │ sentiment│       │
│  │ tagging  │  │ analysis │       │
│  └────┬─────┘  └────┬─────┘       │
│       │             │              │
│       └──────┬──────┘              │
│              │                     │
│       ┌──────▼──────┐             │
│       │ Same Logic  │             │
│       │ (as JS)     │             │
│       └─────────────┘             │
│                                     │
└─────────────────────────────────────┘
```

## Key Design Decisions

### 1. **Customer Isolation**
- **Decision**: Filter data by customer_id before processing
- **Rationale**: Privacy, customization, accuracy
- **Trade-off**: Simpler implementation vs. per-customer models

### 2. **Mock vs. Real AI**
- **Decision**: Use mock implementations (pattern matching, Jaccard similarity)
- **Rationale**: No API costs, fast, reproducible
- **Trade-off**: Lower accuracy vs. production-ready LLMs
- **Future**: Clear path to real embeddings/LLMs documented

### 3. **Dual Implementation**
- **Decision**: Both web app (JS) and standalone scripts (Python)
- **Rationale**: Interactive UI + CLI deliverables
- **Trade-off**: Code duplication vs. flexibility

### 4. **API Routes**
- **Decision**: Server-side API routes for programmatic access
- **Rationale**: Reusability, separation of concerns
- **Trade-off**: Additional complexity vs. better architecture

---

## Technology Stack

```
Frontend:
  - Next.js 16 (React 19)
  - Tailwind CSS v4
  - Radix UI / shadcn/ui

Backend:
  - Next.js API Routes
  - Node.js runtime

Data:
  - In-memory datasets (lib/data.js, lib/kb.js)
  - No external database (for demo)

Deployment:
  - Vercel (hosting)
  - Git (version control)
```

---

## Scalability Considerations

### Current (Demo):
- ✅ In-memory data (fast, simple)
- ✅ Mock algorithms (no API costs)
- ✅ Single deployment

### Production:
- ⚠️ Database for customer data
- ⚠️ Real LLM APIs (OpenAI, Anthropic)
- ⚠️ Embedding service (OpenAI, Cohere)
- ⚠️ Caching layer (Redis)
- ⚠️ Load balancing for high traffic

---

## Security Considerations

### Current:
- ✅ Customer isolation enforced
- ✅ No sensitive data in client
- ✅ API routes server-side only

### Production:
- ⚠️ Authentication/authorization
- ⚠️ Rate limiting
- ⚠️ Input validation
- ⚠️ API key management
- ⚠️ Data encryption at rest

