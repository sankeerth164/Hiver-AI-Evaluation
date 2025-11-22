import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PartATagging } from "@/components/part-a-tagging"
import { PartBSentiment } from "@/components/part-b-sentiment"
import { PartCRag } from "@/components/part-c-rag"

export default function Page() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hiver AI Evaluation</h1>
            <p className="text-muted-foreground mt-1">Interactive dashboard for the AI Intern Assignment.</p>
          </div>
        </div>

        <Tabs defaultValue="part-a" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex lg:w-[400px]">
            <TabsTrigger value="part-a">Tagging</TabsTrigger>
            <TabsTrigger value="part-b">Sentiment</TabsTrigger>
            <TabsTrigger value="part-c">RAG</TabsTrigger>
          </TabsList>

          <TabsContent value="part-a" className="space-y-4">
            <div className="prose dark:prose-invert max-w-none mb-6">
              <h3>Email Tagging</h3>
              <p className="text-sm text-muted-foreground">
                A customer-specific text classification system. Select a customer to see their isolated data and run the
                classification model. The system uses pattern matching and customer-specific context to predict tags.
              </p>
            </div>
            <PartATagging />
          </TabsContent>

          <TabsContent value="part-b" className="space-y-4">
            <div className="prose dark:prose-invert max-w-none mb-6">
              <h3>Sentiment Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Compare a basic prompt (v1) against a structured, reasoning-based prompt (v2). The v2 prompt outputs
                JSON with confidence scores and reasoning to help with debugging.
              </p>
            </div>
            <PartBSentiment />
          </TabsContent>

          <TabsContent value="part-c" className="space-y-4">
            <div className="prose dark:prose-invert max-w-none mb-6">
              <h3>RAG System</h3>
              <p className="text-sm text-muted-foreground">
                A retrieval-augmented generation system. It retrieves relevant articles from the mock Knowledge Base and
                generates an answer. Try asking: <em>"How do I configure automations?"</em> or{" "}
                <em>"Why is CSAT not appearing?"</em>
              </p>
            </div>
            <PartCRag />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

