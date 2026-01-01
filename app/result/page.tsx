"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Eye } from "lucide-react";
import Link from "next/link";

interface QuizResult {
  id: string;
  topic: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

export default function ResultsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchResults = async () => {
      try {
        const q = query(
          collection(db, "results"),
          where("userId", "==", user.uid),
          orderBy("completedAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const resultsData: QuizResult[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          resultsData.push({
            id: doc.id,
            topic: data.topic,
            difficulty: data.difficulty,
            score: data.score,
            totalQuestions: data.totalQuestions,
            completedAt: data.completedAt?.toDate?.() || new Date(),
          });
        });

        setResults(resultsData);
      } catch (err: any) {
        setError(err.message || "Failed to load results.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchResults();
  }, [user, loading, router]);

  if (pageLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="mt-4 text-gray-600">Loading your quiz results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 text-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md w-full">
          <Trophy className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Results
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Your Quiz Results</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {results.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              No Quiz Results Yet
            </h2>
            <p className="text-gray-500 mb-6">
              You haven't taken any quizzes yet. Start your first quiz to see your results here!
            </p>
            <Link href="/quiz/start">
              <Button>
                <Trophy className="h-4 w-4 mr-2" />
                Start Your First Quiz
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(
                      (results.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0) / results.length)
                    )}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Best Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(
                      Math.max(...results.map(r => (r.score / r.totalQuestions) * 100))
                    )}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results List */}
            <div className="space-y-4">
              {results.map((result) => {
                const percentage = Math.round((result.score / result.totalQuestions) * 100);
                const passed = percentage >= 70;

                return (
                  <Card key={result.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{result.topic}</CardTitle>
                          <CardDescription>
                            {result.completedAt.toLocaleDateString()} at{" "}
                            {result.completedAt.toLocaleTimeString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{result.difficulty}</Badge>
                          <Badge
                            variant={passed ? "default" : "destructive"}
                            className={passed ? "bg-green-100 text-green-800" : ""}
                          >
                            {percentage}%
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            Score: {result.score} out of {result.totalQuestions}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {passed ? "✅ Passed" : "❌ Needs Improvement"}
                          </p>
                        </div>
                        <Link href={`/result/${result.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
