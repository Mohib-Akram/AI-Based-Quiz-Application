"use client"
import { doc, getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Trophy, Clock, TrendingUp, Play } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface QuizResult {
  id: string
  topic: string
  difficulty: string
  score: number
  totalQuestions: number
  completedAt: Date
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [userName, setUserName] = useState<string>("")
  const [recentResults, setRecentResults] = useState<QuizResult[]>([])
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
  })
  const router = useRouter()


  const fetchUserName = async () => {
    try {
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data.name) {
          setUserName(data.name)
         

        }
      }

    } catch (error) {
      console.error("Error fetching user name:", error)
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchUserName()
      fetchRecentResults()
      fetchStats()
    }
  }, [user, loading, router])


  const fetchRecentResults = async () => {
    if (!user) return

    try {
      const q = query(
        collection(db, "results"),
        where("userId", "==", user.uid),
        orderBy("completedAt", "desc"),
        limit(5),
      )
      const querySnapshot = await getDocs(q)
      const results: QuizResult[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        results.push({
          id: doc.id,
          topic: data.topic,
          difficulty: data.difficulty,
          score: data.score,
          totalQuestions: data.totalQuestions,
          completedAt: data.completedAt.toDate(),
        })
      })

      setRecentResults(results)
    } catch (error) {
      console.error("Error fetching recent results:", error)
    }
  }

  const fetchStats = async () => {
    if (!user) return

    try {
      const q = query(collection(db, "results"), where("userId", "==", user.uid))
      const querySnapshot = await getDocs(q)

      let totalScore = 0
      let bestScore = 0
      const totalQuizzes = querySnapshot.size

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const scorePercentage = (data.score / data.totalQuestions) * 100
        totalScore += scorePercentage
        if (scorePercentage > bestScore) {
          bestScore = scorePercentage
        }
      })

      setStats({
        totalQuizzes,
        averageScore: totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0,
        bestScore: Math.round(bestScore),
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">AI Quiz Pro</h1>
          </div>

           {/* Navigation */}
          {/* <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
            <Link href="/quiz/start" className="hover:text-blue-600 transition">
              Start Quiz
            </Link>
            <Link href="/result" className="hover:text-blue-600 transition">
              Quiz Results
            </Link>
            <Link href="/leaderboard" className="hover:text-blue-600 transition">
              Leaderboard
            </Link>
            <Link href="/dashboard/about" className="hover:text-blue-600 transition">
              About
            </Link>
          </nav> */}


          {/* Sign Out */}
          <Button variant="outline" onClick={() => router.push("/login")}>
            Sign Out
          </Button>
        </div>
      </div>
    </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {userName || "User"}!
          </h2>


          <p className="text-gray-600">Ready to challenge yourself with AI-generated quizzes?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bestScore}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Start a new quiz or explore features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full" size="lg">
                <Link href="/quiz/start">
                  <Play className="mr-2 h-5 w-5" />
                  Start New Quiz
                </Link>
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <Button asChild variant="outline">
                  <Link href="/leaderboard">Leaderboard</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/result">View Results</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Results */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Results</CardTitle>
              <CardDescription>Your latest quiz performances</CardDescription>
            </CardHeader>
            <CardContent>
              {recentResults.length > 0 ? (
                <div className="space-y-4">
                  {recentResults
                    .sort((a, b) => {
                      const aPercentage = a.score / a.totalQuestions
                      const bPercentage = b.score / b.totalQuestions
                      return bPercentage - aPercentage
                    })
                    .slice(0, 2)
                    .map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{result.topic}</p>
                          <p className="text-sm text-gray-600">
                            {result.completedAt.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              result.score / result.totalQuestions >= 0.7
                                ? "default"
                                : "secondary"
                            }
                          >
                            {result.score}/{result.totalQuestions}
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">{result.difficulty}</p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No quizzes taken yet. Start your first quiz!
                </p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
