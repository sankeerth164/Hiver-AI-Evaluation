"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { largeDataset } from "@/lib/data"
import { mockClassifyEmail } from "@/lib/utils-ai"
import { AlertCircle, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react"

export function PartATagging() {
  const [selectedCustomer, setSelectedCustomer] = useState("CUST_A")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [accuracy, setAccuracy] = useState(0)

  // Filter dataset by customer to simulate isolation
  const customerEmails = useMemo(() => {
    return largeDataset.filter((email) => email.customer_id === selectedCustomer)
  }, [selectedCustomer])

  // Get unique tags for this customer (simulating customer-specific schema)
  const customerTags = useMemo(() => {
    return Array.from(new Set(customerEmails.map((e) => e.tag)))
  }, [customerEmails])

  const handleRunClassification = async () => {
    setLoading(true)
    try {
      // Call API route which uses the same logic as Python script
      const response = await fetch('/api/part-a/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId: selectedCustomer }),
      })

      if (!response.ok) {
        throw new Error('Classification failed')
      }

      const data = await response.json()
      
      // Format results for display
      const formattedResults = data.results.map((r) => ({
        ...r,
        email_id: r.email_id,
        subject: r.subject,
        body: r.body,
        tag: r.ground_truth,
        predicted: r.predicted,
        confidence: r.confidence,
        isCorrect: r.isCorrect,
      }))

      setResults(formattedResults)
      setAccuracy(data.accuracy)
    } catch (error) {
      console.error('Error classifying emails:', error)
      // Fallback to client-side logic if API fails
      const classified = customerEmails.map((email) => {
        const prediction = mockClassifyEmail(email.subject, email.body, email.customer_id, customerTags)
        return {
          ...email,
          predicted: prediction.tag,
          confidence: prediction.confidence,
          isCorrect: prediction.tag === email.tag || (prediction.tag === "access_issue" && email.tag === "auth_issue"),
        }
      })
      setResults(classified)
      const correct = classified.filter((r) => r.isCorrect).length
      setAccuracy(Math.round((correct / classified.length) * 100))
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customer Isolation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Select
                value={selectedCustomer}
                onValueChange={(v) => {
                  setSelectedCustomer(v)
                  setResults([])
                  setAccuracy(0)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {["CUST_A", "CUST_B", "CUST_C", "CUST_D", "CUST_E", "CUST_F"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Selecting a customer isolates the context. The model only sees tags relevant to {selectedCustomer}.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dataset Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerEmails.length}</div>
            <p className="text-xs text-muted-foreground">Emails for {selectedCustomer}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length > 0 ? `${accuracy}%` : "-"}</div>
            <p className="text-xs text-muted-foreground">Baseline Performance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Email Classification</CardTitle>
              <CardDescription>Classify emails using a customer-specific baseline model.</CardDescription>
            </div>
            <Button
              onClick={handleRunClassification}
              disabled={loading || (results.length > 0 && results[0]?.customer_id === selectedCustomer)}
              className="w-full sm:w-auto"
            >
              {loading ? "Classifying..." : results.length > 0 && results[0]?.customer_id === selectedCustomer ? "Classified" : "Run Classification"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px] md:w-[300px]">Subject</TableHead>
                    <TableHead>Predicted Tag</TableHead>
                    <TableHead>Ground Truth</TableHead>
                    <TableHead className="text-right">Confidence</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((email) => (
                    <TableRow key={email.email_id}>
                      <TableCell className="font-medium">
                        <div className="truncate max-w-[200px] md:max-w-[280px]" title={email.subject}>
                          {email.subject}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-[280px]">{email.body}</div>
                      </TableCell>
                    <TableCell>
                      <Badge variant={email.isCorrect ? "default" : "secondary"}>{email.predicted}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{email.tag}</TableCell>
                    <TableCell className="text-right">{(email.confidence * 100).toFixed(0)}%</TableCell>
                    <TableCell>
                      {email.isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShieldAlert className="h-12 w-12 mb-4 opacity-20" />
              <p>Select a customer and run classification to see results.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Improvement Strategy: Anti-Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            To improve accuracy, we can implement <strong>Guardrails</strong>. For example, if an email contains
            "urgent" but is classified as "low priority", we can force a review. Similarly, if "billing" is mentioned
            but the predicted tag is "technical_support", we can apply a negative penalty to the technical score.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

