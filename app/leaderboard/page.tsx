"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface LeaderboardEntry {
  userId: string
  email: string
  name: string
  topic: string
  difficulty: string
  score: number
  totalQuestions: number
  percentage: number
  completedAt: Date
}

const topics = [
  "All Topics",
  "Mathematics",
  "Science",
  "History",
  "Geography",
  "Literature",
  "Technology",
  "Sports",
  "General Knowledge"
]

const difficulties = ["All Difficulties", "Easy", "Medium", "Hard"]

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState("All Topics")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Difficulties")

  useEffect(() => {
    fetchLeaderboard()
  }, [selectedTopic, selectedDifficulty])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const filters = []

      if (selectedTopic !== "All Topics") {
        filters.push(where("topic", "==", selectedTopic))
      }

      if (selectedDifficulty !== "All Difficulties") {
        // Handle case-insensitive difficulty matching
        filters.push(where("difficulty", "==", selectedDifficulty.toLowerCase()))
      }

      const q = query(
        collection(db, "results"),
        ...filters,
        orderBy("completedAt", "desc"),
        limit(50)
      )

      const querySnapshot = await getDocs(q)
      const entries: LeaderboardEntry[] = []

      // Fetch user data for all entries
      const userIds = [...new Set(querySnapshot.docs.map(doc => doc.data().userId))]
      const userDocs = await Promise.all(
        userIds.map(async (userId) => {
          const userDoc = await getDoc(doc(db, "users", userId))
          return { userId, data: userDoc.exists() ? userDoc.data() : null }
        })
      )

      const userDataMap = new Map(
        userDocs.map(({ userId, data }) => [userId, data])
      )

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data()
        const percentage = Math.round((data.score / data.totalQuestions) * 100)
        const userInfo = userDataMap.get(data.userId)

        entries.push({
          userId: data.userId,
          name: userInfo?.name || "",
          email: userInfo?.email || data.email || "Unknown",
          topic: data.topic,
          difficulty: data.difficulty,
          score: data.score,
          totalQuestions: data.totalQuestions,
          percentage,
          completedAt: data.completedAt.toDate()
        })
      }

      // Sort by percentage first, then score
      entries.sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage
        return b.score - a.score
      })

      setLeaderboard(entries)
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-500">1st Place</Badge>
      case 2:
        return <Badge className="bg-gray-400">2nd Place</Badge>
      case 3:
        return <Badge className="bg-amber-600">3rd Place</Badge>
      default:
        return <Badge variant="outline">#{rank}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Filter Results</CardTitle>
              <CardDescription>
                Filter the leaderboard by topic and difficulty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic</label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>
                {selectedTopic !== "All Topics" && `${selectedTopic} • `}
                {selectedDifficulty !== "All Difficulties" &&
                  `${selectedDifficulty} difficulty`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No results found for the selected filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((entry, index) => {
                    const rank = index + 1
                    const isCurrentUser = entry.userId === user?.uid

                    const displayName = isCurrentUser
                      ? "You"
                      : entry.name
                      ? entry.name.charAt(0).toUpperCase() + entry.name.slice(1)
                      : entry.email.split("@")[0].charAt(0).toUpperCase() +
                        entry.email.split("@")[0].slice(1)

                    return (
                      <div
                        key={`${entry.userId}-${entry.completedAt.getTime()}`}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          isCurrentUser ? "bg-blue-50 border-blue-200" : "bg-white"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12">
                            {getRankIcon(rank)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{displayName}</h4>
                              {isCurrentUser && <Badge variant="outline">You</Badge>}
                            </div>
                            <p className="text-sm text-gray-600">
                              {entry.topic} • {entry.difficulty}
                            </p>
                            <p className="text-xs text-gray-500">
                              {entry.completedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="text-lg font-bold">{entry.percentage}%</div>
                              <div className="text-sm text-gray-600">
                                {entry.score}/{entry.totalQuestions}
                              </div>
                            </div>
                            {getRankBadge(rank)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
