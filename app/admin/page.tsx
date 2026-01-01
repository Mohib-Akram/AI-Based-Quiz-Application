"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, AlertTriangle, FileText, ArrowLeft, Shield, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

interface User {
  uid: string
  email: string
  role: string
  createdAt: Date
}

interface MonitoringAlert {
  id: string
  uid: string
  quizId: string
  alertType: string
  timestamp: Date
}

interface QuizResult {
  id: string
  uid: string
  topic: string
  difficulty: string
  score: number
  totalQuestions: number
  completedAt: Date
}

export default function AdminPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([])
  const [results, setResults] = useState<QuizResult[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    totalAlerts: 0,
    averageScore: 0,
  })

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "admin")) {
      router.push("/dashboard")
    }
  }, [user, userData, loading, router])

  useEffect(() => {
    if (userData?.role === "admin") {
      fetchAdminData()
    }
  }, [userData])

  const fetchAdminData = async () => {
    try {
      // Fetch users
      const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(50))
      const usersSnapshot = await getDocs(usersQuery)
      const usersData: User[] = []
      usersSnapshot.forEach((doc) => {
        const data = doc.data()
        usersData.push({
          uid: doc.id,
          email: data.email,
          role: data.role,
          createdAt: data.createdAt.toDate(),
        })
      })
      setUsers(usersData)

      // Fetch monitoring alerts
      const alertsQuery = query(collection(db, "monitoring"), orderBy("timestamp", "desc"), limit(100))
      const alertsSnapshot = await getDocs(alertsQuery)
      const alertsData: MonitoringAlert[] = []
      alertsSnapshot.forEach((doc) => {
        const data = doc.data()
        alertsData.push({
          id: doc.id,
          uid: data.uid,
          quizId: data.quizId,
          alertType: data.alertType,
          timestamp: data.timestamp.toDate(),
        })
      })
      setAlerts(alertsData)

      // Fetch quiz results
      const resultsQuery = query(collection(db, "results"), orderBy("completedAt", "desc"), limit(100))
      const resultsSnapshot = await getDocs(resultsQuery)
      const resultsData: QuizResult[] = []
      resultsSnapshot.forEach((doc) => {
        const data = doc.data()
        resultsData.push({
          id: doc.id,
          uid: data.uid,
          topic: data.topic,
          difficulty: data.difficulty,
          score: data.score,
          totalQuestions: data.totalQuestions,
          completedAt: data.completedAt.toDate(),
        })
      })
      setResults(resultsData)

      // Calculate stats
      const totalUsers = usersData.length
      const totalQuizzes = resultsData.length
      const totalAlerts = alertsData.length
      const averageScore =
        resultsData.length > 0
          ? Math.round(
              resultsData.reduce((sum, result) => sum + (result.score / result.totalQuestions) * 100, 0) /
                resultsData.length,
            )
          : 0

      setStats({
        totalUsers,
        totalQuizzes,
        totalAlerts,
        averageScore,
      })
    } catch (error) {
      console.error("Error fetching admin data:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || userData?.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Shield className="h-8 w-8 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.totalAlerts}</div>
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
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
              <TabsTrigger value="results">Quiz Results</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.uid} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{user.email}</h4>
                          <p className="text-sm text-gray-600">Joined: {user.createdAt.toLocaleDateString()}</p>
                        </div>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts">
              <Card>
                <CardHeader>
                  <CardTitle>Security Monitoring</CardTitle>
                  <CardDescription>Cheating detection alerts and suspicious activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alerts.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No security alerts found.</p>
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200"
                        >
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <div>
                              <h4 className="font-medium text-red-900">{alert.alertType}</h4>
                              <p className="text-sm text-red-700">
                                User: {alert.uid.slice(0, 8)}... • Quiz: {alert.quizId.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 text-red-600">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">{alert.timestamp.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Results</CardTitle>
                  <CardDescription>Overview of all quiz attempts and scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{result.topic}</h4>
                          <p className="text-sm text-gray-600">
                            User: {result.uid.slice(0, 8)}... • {result.difficulty} •{" "}
                            {result.completedAt.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={result.score / result.totalQuestions >= 0.8 ? "default" : "secondary"}>
                            {result.score}/{result.totalQuestions}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            {Math.round((result.score / result.totalQuestions) * 100)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
