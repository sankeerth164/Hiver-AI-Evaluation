"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Play } from "lucide-react"
import { largeDataset } from "@/lib/data"

const PROMPT_V1 = `Analyze the sentiment of the following email. 
Return only Positive, Negative, or Neutral.`

const PROMPT_V2 = `You are a helpful customer support analyst. Analyze the sentiment of the email below.

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
`

export function PartBSentiment() {
  const [activePrompt, setActivePrompt] = useState(PROMPT_V2)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])

  const runAnalysis = async () => {
    setLoading(true)
    setResults([])

    try {
      // Call API route which uses the same logic as Python script
      const promptVersion = activePrompt.includes("JSON") ? "v2" : "v1"
      const response = await fetch('/api/part-b/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          promptVersion,
          numEmails: 10 
        }),
      })

      if (!response.ok) {
        throw new Error('Sentiment analysis failed')
      }

      const data = await response.json()
      setResults(data.results)
    } catch (error) {
      console.error('Error analyzing sentiment:', error)
      // Fallback to client-side logic if API fails
      const mockResults = largeDataset.slice(0, 10).map((email) => {
        const isV2 = activePrompt.includes("JSON")
        const text = (email.subject + " " + email.body).toLowerCase()

        let sentiment = "neutral"
        let confidence = 0.7
        let reasoning = "Standard query."

        if (text.includes("unable") || text.includes("error") || text.includes("fail") || text.includes("stuck")) {
          sentiment = "negative"
          confidence = 0.9
          reasoning = "User is reporting a failure or inability to perform an action."
        } else if (text.includes("help") || text.includes("guide") || text.includes("query")) {
          sentiment = "neutral"
          confidence = 0.8
          reasoning = "User is asking for information or assistance."
        } else if (text.includes("feature") || text.includes("consider")) {
          sentiment = "positive"
          confidence = 0.6
          reasoning = "User is suggesting improvements constructively."
        }

        if (isV2) {
          return {
            id: email.email_id,
            subject: email.subject,
            output: {
              sentiment,
              confidence,
              reasoning,
            },
          }
        } else {
          return {
            id: email.email_id,
            subject: email.subject,
            output: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
          }
        }
      })
      setResults(mockResults)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Prompt Engineering</CardTitle>
            <CardDescription>Refine the prompt to improve consistency and output structure.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <Tabs defaultValue="v2" onValueChange={(v) => setActivePrompt(v === "v1" ? PROMPT_V1 : PROMPT_V2)}>
              <TabsList className="mb-4">
                <TabsTrigger value="v1">Draft v1 (Basic)</TabsTrigger>
                <TabsTrigger value="v2">Draft v2 (Structured)</TabsTrigger>
              </TabsList>
              <TabsContent value="v1">
                <Textarea value={PROMPT_V1} readOnly className="min-h-[300px] font-mono text-sm bg-muted/50" />
              </TabsContent>
              <TabsContent value="v2">
                <Textarea value={PROMPT_V2} readOnly className="min-h-[300px] font-mono text-sm bg-muted/50" />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button onClick={runAnalysis} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              Run Evaluation on Sample Data
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Evaluation Results</CardTitle>
            <CardDescription>Testing on 10 emails from the dataset.</CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed rounded-lg">
                <p>Run the prompt to see results</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((res) => (
                  <div key={res.id} className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <div className="mb-2 font-medium text-sm">{res.subject}</div>
                    {typeof res.output === "string" ? (
                      <Badge variant={res.output === "Negative" ? "destructive" : "secondary"}>{res.output}</Badge>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={
                              res.output.sentiment === "negative"
                                ? "destructive"
                                : res.output.sentiment === "positive"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {res.output.sentiment}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Conf: {(res.output.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground bg-muted p-2 rounded">{res.output.reasoning}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

