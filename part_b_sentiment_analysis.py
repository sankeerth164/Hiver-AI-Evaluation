#!/usr/bin/env python3
"""
Part B — Sentiment Analysis Prompt Evaluation
Standalone script for evaluating sentiment analysis prompts.

Run: python part_b_sentiment_analysis.py
"""

import json
from typing import Dict, List

# Test emails (10 emails as required)
TEST_EMAILS = [
    {"id": 1, "subject": "Unable to access shared mailbox", 
     "body": "Hi team, I'm unable to access the shared mailbox for our support team. It keeps showing a permissions error. Can you please check?"},
    {"id": 2, "subject": "Rules not working", 
     "body": "We created a rule to auto-assign emails based on subject line but it stopped working since yesterday."},
    {"id": 3, "subject": "Email stuck in pending", 
     "body": "One of our emails is stuck in pending even after marking it resolved. Not sure what's happening."},
    {"id": 4, "subject": "Automation creating duplicate tasks", 
     "body": "Your automation engine is creating 2 tasks for every email. This started after we edited our workflow."},
    {"id": 5, "subject": "Tags missing", 
     "body": "Many of our tags are not appearing for new emails. Looks like the tagging model is not working for us."},
    {"id": 6, "subject": "Billing query", 
     "body": "We were charged incorrectly this month. Need a corrected invoice."},
    {"id": 7, "subject": "CSAT not visible", 
     "body": "CSAT scores disappeared from our dashboard today. Is there an outage?"},
    {"id": 8, "subject": "Delay in email loading", 
     "body": "Opening a conversation takes 8–10 seconds. This is affecting our productivity."},
    {"id": 9, "subject": "Need help setting up SLAs", 
     "body": "We want to configure SLAs for different customer tiers. Can someone guide us?"},
    {"id": 10, "subject": "Feature request: Dark mode", 
     "body": "Dark mode would help during late-night support hours. Please consider this."},
]

# Prompt Versions
PROMPT_V1 = """Analyze the sentiment of the following email. 
Return only Positive, Negative, or Neutral."""

PROMPT_V2 = """You are a helpful customer support analyst. Analyze the sentiment of the email below.

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
"""

def analyze_sentiment_v1(email_text: str) -> str:
    """
    Mock sentiment analysis using Prompt V1 (basic).
    Returns: "Positive", "Negative", or "Neutral"
    """
    text = email_text.lower()
    
    if any(word in text for word in ["unable", "error", "fail", "stuck", "not working", "missing", "disappeared"]):
        return "Negative"
    elif any(word in text for word in ["help", "guide", "query", "need"]):
        return "Neutral"
    elif any(word in text for word in ["feature", "consider", "request"]):
        return "Positive"
    else:
        return "Neutral"

def analyze_sentiment_v2(email_text: str) -> Dict:
    """
    Mock sentiment analysis using Prompt V2 (structured).
    Returns: {"sentiment": "...", "confidence": 0.0-1.0, "reasoning": "..."}
    """
    text = email_text.lower()
    
    sentiment = "neutral"
    confidence = 0.7
    reasoning = "Standard query."
    
    if any(word in text for word in ["unable", "error", "fail", "stuck", "not working", "missing", "disappeared"]):
        sentiment = "negative"
        confidence = 0.9
        reasoning = "User is reporting a failure or inability to perform an action."
    elif any(word in text for word in ["help", "guide", "query", "need"]):
        sentiment = "neutral"
        confidence = 0.8
        reasoning = "User is asking for information or assistance."
    elif any(word in text for word in ["feature", "consider", "request"]):
        sentiment = "positive"
        confidence = 0.6
        reasoning = "User is suggesting improvements constructively."
    
    return {
        "sentiment": sentiment,
        "confidence": confidence,
        "reasoning": reasoning
    }

def evaluate_prompt_v1() -> List[Dict]:
    """Evaluate emails using Prompt V1."""
    results = []
    for email in TEST_EMAILS:
        email_text = f"{email['subject']} {email['body']}"
        sentiment = analyze_sentiment_v1(email_text)
        
        results.append({
            "id": email["id"],
            "subject": email["subject"],
            "output": sentiment
        })
    return results

def evaluate_prompt_v2() -> List[Dict]:
    """Evaluate emails using Prompt V2."""
    results = []
    for email in TEST_EMAILS:
        email_text = f"{email['subject']} {email['body']}"
        analysis = analyze_sentiment_v2(email_text)
        
        results.append({
            "id": email["id"],
            "subject": email["subject"],
            "output": analysis
        })
    return results

def print_results_v1(results: List[Dict]):
    """Print results for Prompt V1."""
    print("\n" + "="*60)
    print("PROMPT V1 RESULTS (Basic)")
    print("="*60)
    for result in results:
        print(f"\nEmail {result['id']}: {result['subject']}")
        print(f"  Sentiment: {result['output']}")

def print_results_v2(results: List[Dict]):
    """Print results for Prompt V2."""
    print("\n" + "="*60)
    print("PROMPT V2 RESULTS (Structured)")
    print("="*60)
    for result in results:
        output = result['output']
        print(f"\nEmail {result['id']}: {result['subject']}")
        print(f"  Sentiment: {output['sentiment']}")
        print(f"  Confidence: {output['confidence']:.1%}")
        print(f"  Reasoning: {output['reasoning']}")

def compare_prompts():
    """Compare both prompt versions."""
    print("="*60)
    print("Part B — Sentiment Analysis Prompt Evaluation")
    print("="*60)
    
    print("\n" + "-"*60)
    print("PROMPT V1 (Basic)")
    print("-"*60)
    print(PROMPT_V1)
    
    print("\n" + "-"*60)
    print("PROMPT V2 (Structured)")
    print("-"*60)
    print(PROMPT_V2)
    
    # Evaluate both
    results_v1 = evaluate_prompt_v1()
    results_v2 = evaluate_prompt_v2()
    
    # Print results
    print_results_v1(results_v1)
    print_results_v2(results_v2)
    
    # Comparison
    print("\n" + "="*60)
    print("COMPARISON")
    print("="*60)
    print("\nV1 Characteristics:")
    print("  - Simple, unstructured output")
    print("  - No confidence scores")
    print("  - No reasoning provided")
    
    print("\nV2 Improvements:")
    print("  - Structured JSON output")
    print("  - Confidence scores for each prediction")
    print("  - Reasoning helps with debugging")
    print("  - Context-specific rules")
    
    print("\n" + "="*60)
    print("Evaluation Complete")
    print("="*60)

def main():
    """Main execution function."""
    compare_prompts()

if __name__ == "__main__":
    main()

