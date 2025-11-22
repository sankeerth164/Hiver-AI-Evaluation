"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { kbArticles } from "@/lib/kb"
import { calculateSimilarity } from "@/lib/utils-ai"
import { Search, FileText, ChevronRight } from "lucide-react"

export function PartCRag() {
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm the Hiver Copilot. Ask me anything about our features." },
  ])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    const userMsg = { role: "user", content: query }
    setMessages((prev) => [...prev, userMsg])
    const currentQuery = query
    setQuery("")
    setIsProcessing(true)

    try {
      // Call API route which uses the same logic as Python script
      const response = await fetch('/api/part-c/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: currentQuery }),
      })

      if (!response.ok) {
        throw new Error('RAG query failed')
      }

      const data = await response.json()

      const assistantMsg = {
        role: "assistant",
        content: data.answer,
        retrieved: data.retrievedArticles.map(a => ({
          id: a.id,
          title: a.title,
          tags: a.tags,
        })),
        confidence: data.confidence,
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (error) {
      console.error('Error processing RAG query:', error)
      // Fallback to client-side logic if API fails
      const scoredArticles = kbArticles
        .map((article) => ({
          article,
          score: calculateSimilarity(currentQuery, article.title + " " + article.content + " " + article.tags.join(" ")),
        }))
        .sort((a, b) => b.score - a.score)

      const relevantArticles = scoredArticles
        .filter((a) => a.score > 0.05)
        .slice(0, 2)
        .map((a) => a.article)
      const topScore = scoredArticles[0]?.score || 0

      let answer = ""
      if (relevantArticles.length > 0) {
        const context = relevantArticles[0]
        const queryLower = currentQuery.toLowerCase()
        if (queryLower.includes("automation") || queryLower.includes("configure")) {
          answer = `Based on our knowledge base, you can configure automations in the Admin Panel. ${context.content}`
        } else if (queryLower.includes("csat") || queryLower.includes("visibility") || queryLower.includes("appearing") || queryLower.includes("not showing")) {
          answer = `Regarding CSAT visibility: ${context.content}`
        } else if (queryLower.includes("sla") || queryLower.includes("service level")) {
          answer = `Here's information about SLAs: ${context.content}`
        } else if (queryLower.includes("billing") || queryLower.includes("invoice")) {
          answer = `Regarding billing: ${context.content}`
        } else if (queryLower.includes("mailbox") || queryLower.includes("shared")) {
          answer = `About shared mailboxes: ${context.content}`
        } else if (queryLower.includes("merge") || queryLower.includes("mail merge")) {
          answer = `Regarding mail merge: ${context.content}`
        } else {
          answer = `Here is what I found: ${context.content}`
        }
      } else {
        answer = "I couldn't find any specific articles related to your query in the knowledge base. Could you try rephrasing?"
      }

      const assistantMsg = {
        role: "assistant",
        content: answer,
        retrieved: relevantArticles,
        confidence: topScore,
      }

      setMessages((prev) => [...prev, assistantMsg])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 min-h-[400px] lg:h-[600px]">
      <Card className="lg:col-span-2 flex flex-col h-full">
        <CardHeader>
          <CardTitle>Hiver Copilot (Mini-RAG)</CardTitle>
          <CardDescription>Ask questions to retrieve answers from the Knowledge Base.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    {msg.retrieved && msg.retrieved.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                        <p className="text-xs font-semibold mb-1 flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          Sources (Confidence: {(msg.confidence * 100).toFixed(0)}%)
                        </p>
                        <div className="space-y-1">
                          {msg.retrieved.map((doc) => (
                            <div key={doc.id} className="text-xs bg-background/50 p-1.5 rounded border">
                              <span className="font-medium">{doc.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <form onSubmit={handleSearch} className="flex w-full space-x-2">
            <Input
              placeholder="Ask about automations, CSAT, etc..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" disabled={isProcessing}>
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>

      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm">Knowledge Base</CardTitle>
          <CardDescription>Available articles for retrieval</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-3">
              {kbArticles.map((article) => (
                <div
                  key={article.id}
                  className="p-3 border rounded-md text-sm hover:bg-muted/50 transition-colors cursor-help group"
                >
                  <div className="font-medium flex items-center justify-between">
                    {article.title}
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

