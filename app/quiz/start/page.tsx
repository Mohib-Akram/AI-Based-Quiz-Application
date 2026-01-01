"use client"

import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Brain, Loader2, UploadCloud } from "lucide-react"
import { useRouter } from "next/navigation"

const topics = [
  "Mathematics",
  "Science",
  "History",
  "Geography",
  "Literature",
  "Technology",
  "Sports",
  "General Knowledge",
]

const difficulties = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
]

export default function QuizStartPage() {
  const { user } = useAuth()
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [questionCount, setQuestionCount] = useState("5")
  const [loading, setLoading] = useState(false)
  const [generationMode, setGenerationMode] = useState("topic") // 'topic' or 'document'
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [documentReady, setDocumentReady] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDocumentUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please choose a PDF document to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!topic) {
      toast({
        title: "Missing Topic",
        description: "Please enter a topic name for this document.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setDocumentReady(false);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("topic", topic);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.NEXT_PUBLIC_BACKEND_API_KEY || "",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload document");
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: data.message,
      });
      setDocumentReady(true); // Enable the generate button
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartQuiz = async () => {
    if (generationMode === "topic") {
      if (!topic || !difficulty) {
        toast({
          title: "Missing Information",
          description: "Please select both topic and difficulty level.",
          variant: "destructive",
        });
        return;
      }
    } else { // document mode
      if (!documentReady || !topic || !difficulty) {
        toast({
          title: "Missing Information",
          description: "Please upload a document, provide a topic from the document, and select a difficulty.",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      let quizData;
      if (generationMode === "topic") {
        const response = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic,
            difficulty,
            questionCount: Number.parseInt(questionCount),
          }),
        });
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || "Failed to generate quiz from topic.");
        }
        quizData = data;
      } else { // document mode
        const formData = new FormData();
        formData.append("topic", topic);
        formData.append("difficulty", difficulty);
        formData.append("num_questions", questionCount);

        const response = await fetch("http://127.0.0.1:8000/generate-quiz/", {
          method: "POST",
          headers: {
            "X-API-KEY": process.env.NEXT_PUBLIC_BACKEND_API_KEY || "",
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to generate quiz from document.");
        }
        
        const questions = await response.json();
        quizData = {
          success: true,
          quizId: `rag_${Date.now()}`,
          questions: questions,
        };
      }

      sessionStorage.setItem(
        "currentQuiz",
        JSON.stringify({
          quizId: quizData.quizId,
          questions: quizData.questions,
          topic,
          difficulty,
          startTime: Date.now(),
        }),
      );
      const nextUrl = `/quiz/${quizData.quizId}`;
      router.push(nextUrl);
      router.refresh();
      setTimeout(() => {
        if (typeof window !== "undefined" && window.location.pathname !== nextUrl) {
          window.location.href = nextUrl;
        }
      }, 300);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">AI Quiz Pro</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create Your Quiz</CardTitle>
              <CardDescription>
                Choose to generate from a topic or upload your own document.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Generation Mode Tabs */}
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
                <Button
                  variant={generationMode === "topic" ? "default" : "ghost"}
                  onClick={() => setGenerationMode("topic")}
                >
                  From Topic
                </Button>
                <Button
                  variant={generationMode === "document" ? "default" : "ghost"}
                  onClick={() => setGenerationMode("document")}
                >
                  From Document
                </Button>
              </div>
              {generationMode === "topic" && (
                <>
                  {/* Topic Selection */}
                  <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Select
                  value={topics.includes(topic) ? topic : "custom"}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setTopic("")
                    } else {
                      setTopic(value)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic or enter your own" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Other (Enter your own topic)</SelectItem>
                  </SelectContent>
                </Select>

                {!topics.includes(topic) && (
                  <input
                    type="text"
                    placeholder="Enter your custom topic (e.g., Python Loops)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full mt-2 border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                )}
                  </div>
                </>
              )}

              {generationMode === 'document' && (
                <div className="space-y-4 text-center">
                  <Label htmlFor="document-upload" className="cursor-pointer block w-full rounded-lg border-2 border-dashed border-gray-300 p-6 hover:bg-gray-50">
                    <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-700">
                      {selectedFile ? selectedFile.name : 'Upload a PDF document'}
                    </span>
                    <input id="document-upload" type="file" className="sr-only" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
                  </Label>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="document-topic">Topic (from this document)</Label>
                    <input
                      id="document-topic"
                      type="text"
                      placeholder="e.g., Photosynthesis, SQL Joins, World War 2"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>
                  {selectedFile && (
                    <Button onClick={handleDocumentUpload} className="w-full" disabled={isUploading}>
                      {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isUploading ? 'Processing...' : 'Upload & Process Document'}
                    </Button>
                  )}
                </div>
              )}

              {/* Difficulty */}
              <div className="space-y-3">
                <Label>Difficulty Level</Label>
                <RadioGroup value={difficulty} onValueChange={setDifficulty}>
                  {difficulties.map((d) => (
                    <div key={d.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={d.value} id={d.value} />
                      <Label htmlFor={d.value}>{d.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Question Count */}
              <div className="space-y-2">
                <Label htmlFor="questionCount">Number of Questions</Label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="15">15 Questions</SelectItem>
                    <SelectItem value="20">20 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button onClick={handleStartQuiz} className="w-full" size="lg" disabled={loading || (generationMode === 'document' && !documentReady)}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  generationMode === 'topic' ? 'Start Quiz' : 'Generate Quiz from Document'
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                <p>⚠️ Camera monitoring will be active during the quiz</p>
                <p>Make sure you're in a well-lit environment</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
