# Hiver AI Evaluation Dashboard

An interactive Next.js application demonstrating three AI/ML evaluation tasks:
- **Part A**: Customer-specific email tagging with isolation
- **Part B**: Sentiment analysis prompt evaluation
- **Part C**: Mini-RAG system for knowledge base answering

## Features

### Part A: Email Tagging Mini-System
- Customer-specific email classification
- Pattern-based baseline classifier
- Customer isolation enforcement
- Accuracy metrics and error analysis
- See [PART_A_README.md](./PART_A_README.md) for detailed documentation

### Part B: Sentiment Analysis Prompt Evaluation
- Compare basic vs structured prompts
- Confidence scoring and reasoning
- Side-by-side evaluation results
- See [PART_B_REPORT.md](./PART_B_REPORT.md) for evaluation report

### Part C: Mini-RAG for Knowledge Base
- Retrieval-augmented generation system
- Interactive query interface
- Confidence scoring and source attribution
- See [PART_C_RAG_IMPROVEMENTS.md](./PART_C_RAG_IMPROVEMENTS.md) for improvements

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── layout.jsx          # Root layout
│   └── page.jsx            # Main dashboard page
├── components/
│   ├── part-a-tagging.jsx  # Email tagging component
│   ├── part-b-sentiment.jsx # Sentiment analysis component
│   ├── part-c-rag.jsx      # RAG system component
│   └── ui/                 # UI components
├── lib/
│   ├── data.js             # Email datasets
│   ├── kb.js               # Knowledge base articles
│   └── utils-ai.js         # AI utility functions
├── hooks/
│   ├── use-mobile.js       # Mobile detection hook
│   └── use-toast.js        # Toast notification hook
└── Documentation/
    ├── PART_A_README.md
    ├── PART_B_REPORT.md
    └── PART_C_RAG_IMPROVEMENTS.md
```

## Documentation

- **[Part A Documentation](./PART_A_README.md)**: Email tagging approach, customer isolation, and improvement ideas
- **[Part B Report](./PART_B_REPORT.md)**: Sentiment analysis prompt evaluation and systematic evaluation guide
- **[Part C Improvements](./PART_C_RAG_IMPROVEMENTS.md)**: RAG retrieval improvements and failure case analysis

## Technology Stack

- **Framework**: Next.js 16
- **UI**: React 19, Tailwind CSS v4
- **Components**: Radix UI, shadcn/ui
- **Language**: JavaScript (converted from TypeScript)

## Standalone Scripts

The project includes standalone Python scripts that can be run independently:

```bash
# Part A: Email Tagging
python part_a_email_tagging.py

# Part B: Sentiment Analysis  
python part_b_sentiment_analysis.py

# Part C: RAG System
python part_c_rag_system.py
```

These scripts produce the same results as the web application. See [INTEGRATION.md](./INTEGRATION.md) for details on how they integrate.

## API Routes

The web application exposes API endpoints:

- `POST /api/part-a/classify` - Email classification with customer isolation
- `POST /api/part-b/sentiment` - Sentiment analysis with prompt evaluation
- `POST /api/part-c/rag` - RAG query processing

## Notes

- This is a demonstration/prototype system
- Current implementations use mock/simplified algorithms
- For production, replace with proper LLM APIs and embedding models
- See individual documentation files for detailed explanations
- See [INTEGRATION.md](./INTEGRATION.md) for Python script integration details

## License

This project is part of an AI evaluation assignment.

