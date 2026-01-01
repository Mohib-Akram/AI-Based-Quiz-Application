"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import {  addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { WebcamMonitor } from "@/components/webcam-monitor"
import { useToast } from "@/hooks/use-toast"
import { Clock, AlertTriangle } from "lucide-react"

interface Question {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizData {
  quizId: string
  questions: Question[]
  topic: string
  difficulty: string
  startTime: number
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const webcamRef = useRef<any>(null) // 👈 For controlling the webcam

  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes default
  const [violations, setViolations] = useState(0)
  const [userName, setUserName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const MAX_VIOLATIONS = 5

  useEffect(() => {
    const storedQuiz = sessionStorage.getItem("currentQuiz")
    if (storedQuiz) {
      const quiz = JSON.parse(storedQuiz)
      setQuizData(quiz)
      setAnswers(new Array(quiz.questions.length).fill(-1))

      const elapsed = Math.floor((Date.now() - quiz.startTime) / 1000)
      setTimeLeft(Math.max(0, 600 - elapsed))
    } else {
      router.push("/quiz/start")
    }
  }, [router])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      handleSubmitQuiz()
    }
  }, [timeLeft])
  useEffect(() => {
  const fetchName = async () => {
    if (!user?.uid) return;
    const docRef = doc(db, "users", user.uid)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      setUserName(data.name || "")
      console.log("username",data.name)
    }
    // console.log("username",data.name)
  }

  if (user?.uid) fetchName()
}, [user])

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = Number.parseInt(value)
    setAnswers(newAnswers)
  }

const handleViolation = (type: string) => {
  setViolations((prev) => {
    const newCount = prev + 1

    // Show toast every time
    toast({
      title: "Monitoring Alert",
      description: `${type} detected. Please ensure you're alone and facing the camera.`,
      variant: "destructive",
    })

    // Auto-submit if threshold reached
    if (newCount >= MAX_VIOLATIONS && !isSubmitting) {
      toast({
        title: "Too Many Violations",
        description: "The quiz will now be auto-submitted.",
        variant: "destructive",
      })

      handleSubmitQuiz()
    }

    return newCount
  })
}

  const handleSubmitQuiz = async () => {
    if (!quizData || !user) return 

    setIsSubmitting(true)

    try {
      // ✅ Stop webcam before submitting
      webcamRef.current?.stopMonitoring()

      let score = 0
      const results = quizData.questions.map((question, index) => {
        const isCorrect = answers[index] === question.correctAnswer
        if (isCorrect) score++

        return {
          question: question.question,
          options: question.options,
          userAnswer: answers[index],
          correctAnswer: question.correctAnswer,
          isCorrect,
          explanation: question.explanation || "",
        }
      })


      // Create a temporary ID for the results page to navigate to.
      // The results page will then listen for the actual document.
      const tempResultId = `temp_${user.uid}_${Date.now()}`;
      sessionStorage.setItem("tempResultId", tempResultId);
      router.push(`/result/${tempResultId}`);

      // Save the data in the background.
      addDoc(collection(db, "results"), {
        userId: user?.uid,
        name: userName || "Unknown",
        email: user?.email || "Unknown",
        quizId: quizData.quizId,
        topic: quizData.topic,
        difficulty: quizData.difficulty,
        score,
        totalQuestions: quizData.questions.length,
        answers: results,
        violations,
        completedAt: serverTimestamp(),
        timeSpent: Math.floor((Date.now() - quizData.startTime) / 1000),
        // Add the tempId to the document so the results page can find it.
        tempId: tempResultId,
      });

      sessionStorage.removeItem("currentQuiz");
      



    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100
  const currentQ = quizData.questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{quizData.topic} Quiz</h1>
              <p className="text-sm text-gray-600">
                Difficulty: {quizData.difficulty} | Question {currentQuestion + 1} of {quizData.questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {violations > 0 && (
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span className="text-sm">{violations} alerts</span>
                </div>
              )}
              <div className="flex items-center text-blue-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
          <Progress value={progress} className="mt-2" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Quiz Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question {currentQuestion + 1}</CardTitle>
                <CardDescription className="text-base leading-relaxed">{currentQ.question}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={answers[currentQuestion]?.toString() || ""} onValueChange={handleAnswerChange}>
                  {currentQ.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>

                  {currentQuestion === quizData.questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Quiz"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentQuestion(Math.min(quizData.questions.length - 1, currentQuestion + 1))}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Camera Monitor</CardTitle>
              </CardHeader>
              <CardContent>
                {/* ✅ Pass ref here */}
                <WebcamMonitor ref={webcamRef} quizId={quizData.quizId} onViolation={handleViolation} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {quizData.questions.map((_, index) => (
                    <Button
                      key={index}
                      variant={currentQuestion === index ? "default" : "outline"}
                      size="sm"
                      className={`h-8 w-8 p-0 ${answers[index] !== -1 ? "bg-green-100 border-green-300" : ""}`}
                      onClick={() => setCurrentQuestion(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Answered: {answers.filter((a) => a !== -1).length} / {quizData.questions.length}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
