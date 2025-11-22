#!/usr/bin/env python3
"""
Part C — Mini-RAG for Knowledge Base Answering
Standalone script for RAG system with retrieval and generation.

Run: python part_c_rag_system.py
"""

import json
from typing import Dict, List, Tuple

# Knowledge Base Articles
KB_ARTICLES = [
    {
        "id": "kb_001",
        "title": "How to Configure Automations",
        "content": "To configure automations in Hiver, go to the Admin Panel > Automations. Click on 'Create New Automation'. You can set triggers based on subject, sender, or body content. Actions include auto-assigning, tagging, or changing status. Ensure you save your changes for the automation to take effect immediately.",
        "tags": ["automation", "setup", "configuration"]
    },
    {
        "id": "kb_002",
        "title": "Troubleshooting CSAT Visibility",
        "content": "If CSAT scores are not appearing in your dashboard, first check if the CSAT feature is enabled in Settings > Feedback. If enabled, verify that the date range filter in the Analytics dashboard includes the dates where surveys were sent. Note that CSAT data may take up to 1 hour to sync after a customer responds.",
        "tags": ["csat", "analytics", "troubleshooting"]
    },
    {
        "id": "kb_003",
        "title": "Managing Shared Mailboxes",
        "content": "Shared mailboxes allow multiple users to access the same email account. To add a user, go to Settings > Shared Mailboxes > Users. If you encounter permission errors, ensure the user has been granted 'Full Access' or 'Delegate' permissions in the Google Workspace admin console as well.",
        "tags": ["mailbox", "permissions", "access"]
    },
    {
        "id": "kb_004",
        "title": "Setting up SLAs",
        "content": "Service Level Agreements (SLAs) help track response and resolution times. Navigate to Admin > SLAs. You can define different policies for different customer tiers (e.g., VIP vs Standard). SLAs can be configured to trigger alerts if a conversation remains unreplied for a specific duration.",
        "tags": ["sla", "setup", "timings"]
    },
    {
        "id": "kb_005",
        "title": "Understanding Billing and Invoices",
        "content": "Hiver billing is based on the number of active seats. You can view your current plan and invoices under Settings > Billing. If you see a discrepancy in user count, check the 'Inactive Users' list to ensure removed users are not still consuming a license.",
        "tags": ["billing", "finance", "account"]
    },
    {
        "id": "kb_006",
        "title": "Mail Merge Guide",
        "content": "Mail merge allows sending personalized emails to multiple recipients. Upload your CSV file with columns matching your variables (e.g., {{First Name}}). If the merge fails, check that your CSV is UTF-8 encoded and contains no empty rows. The daily sending limit depends on your Google Workspace plan.",
        "tags": ["mail merge", "email", "feature"]
    }
]

def calculate_similarity(text1: str, text2: str) -> float:
    """
    Calculate Jaccard similarity between two texts.
    This is a mock embedding - in production, use proper embeddings.
    """
    # Tokenize and create sets
    words1 = set(w.lower() for w in text1.split() if len(w) > 2)
    words2 = set(w.lower() for w in text2.split() if len(w) > 2)
    
    # Jaccard similarity
    intersection = len(words1 & words2)
    union = len(words1 | words2)
    
    return intersection / union if union > 0 else 0.0

def retrieve_articles(query: str, top_k: int = 2, threshold: float = 0.1) -> List[Tuple[Dict, float]]:
    """
    Retrieve relevant articles using similarity search.
    Returns: List of (article, score) tuples
    """
    scored_articles = []
    
    for article in KB_ARTICLES:
        # Combine article text for matching
        article_text = f"{article['title']} {article['content']} {' '.join(article['tags'])}"
        
        # Calculate similarity
        score = calculate_similarity(query, article_text)
        
        scored_articles.append((article, score))
    
    # Sort by score (descending)
    scored_articles.sort(key=lambda x: x[1], reverse=True)
    
    # Filter by threshold and return top_k
    relevant = [(article, score) for article, score in scored_articles if score > threshold]
    
    return relevant[:top_k]

def generate_answer(query: str, retrieved_articles: List[Tuple[Dict, float]]) -> Dict:
    """
    Generate answer from retrieved articles.
    In production, this would use an LLM.
    """
    if not retrieved_articles:
        return {
            "answer": "I couldn't find any specific articles related to your query in the knowledge base. Could you try rephrasing?",
            "confidence": 0.0,
            "sources": []
        }
    
    # Get top article
    top_article, top_score = retrieved_articles[0]
    
    # Simple template-based generation (mock LLM)
    query_lower = query.lower()
    
    if "automation" in query_lower:
        answer = f"Based on our knowledge base, you can configure automations in the Admin Panel. {top_article['content']}"
    elif "csat" in query_lower:
        answer = f"Regarding CSAT visibility: {top_article['content']}"
    else:
        answer = f"Here is what I found: {top_article['content']}"
    
    # Extract sources
    sources = [article["title"] for article, _ in retrieved_articles]
    
    return {
        "answer": answer,
        "confidence": top_score,
        "sources": sources,
        "retrieved_articles": [article for article, _ in retrieved_articles]
    }

def query_rag(query: str) -> Dict:
    """
    Complete RAG pipeline: Retrieve + Generate.
    """
    print(f"\n{'='*60}")
    print(f"Query: {query}")
    print(f"{'='*60}\n")
    
    # Step 1: Retrieval
    print("Step 1: Retrieving relevant articles...")
    retrieved = retrieve_articles(query, top_k=2, threshold=0.1)
    
    print(f"Retrieved {len(retrieved)} articles:")
    for article, score in retrieved:
        print(f"  - {article['title']} (score: {score:.3f})")
    
    # Step 2: Generation
    print("\nStep 2: Generating answer...")
    result = generate_answer(query, retrieved)
    
    print(f"\nAnswer (confidence: {result['confidence']:.1%}):")
    print(f"  {result['answer']}")
    
    print(f"\nSources:")
    for source in result['sources']:
        print(f"  - {source}")
    
    return result

def main():
    """Main execution function."""
    print("="*60)
    print("Part C — Mini-RAG for Knowledge Base Answering")
    print("="*60)
    
    # Required queries from assignment
    queries = [
        "How do I configure automations in Hiver?",
        "Why is CSAT not appearing?"
    ]
    
    results = []
    for query in queries:
        result = query_rag(query)
        results.append({
            "query": query,
            "result": result
        })
        print()
    
    # Summary
    print("="*60)
    print("SUMMARY")
    print("="*60)
    for i, item in enumerate(results, 1):
        print(f"\nQuery {i}: {item['query']}")
        print(f"  Confidence: {item['result']['confidence']:.1%}")
        print(f"  Sources: {len(item['result']['sources'])}")
    
    print("\n" + "="*60)
    print("RAG System Components:")
    print("1. Retrieval: Jaccard similarity (mock embedding)")
    print("2. Generation: Template-based (mock LLM)")
    print("3. Confidence: Based on retrieval score")
    print("="*60)

if __name__ == "__main__":
    main()

