"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
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
import { Progress } from "@/components/ui/progress";

import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  RotateCcw,
  Trophy,
} from "lucide-react";

import Link from "next/link";

/* -------------------- Types -------------------- */
interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizResult {
  userId: string;
  quizId: string;
  topic: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  answers: {
    question: string;
    options: string[];
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation: string;
  }[];
  completedAt: Date;
}

/* -------------------- Component -------------------- */
export default function ResultPage() {
  const { user, loading } = useAuth();
  const { resultId } = useParams<{ resultId: string }>();
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* -------------------- Debug Logs -------------------- */
  console.log("🔍 authLoading:", loading, "user:", user, "resultId:", resultId);

  /* -------------------- Fetch Result -------------------- */
  useEffect(() => {
    // Only proceed if auth is not loading and we have a user and resultId
    if (loading) return;
    if (!user) {
      setError("Please sign in to view results");
      setPageLoading(false);
      return;
    }
    if (!resultId) {
      setError("No result ID provided");
      setPageLoading(false);
      return;
    }

    if (resultId.startsWith("temp_")) {
      const q = query(collection(db, "results"), where("tempId", "==", resultId));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const snap = querySnapshot.docs[0];
          const raw = snap.data();

          if (raw.userId !== user.uid) {
            setError("You don't have permission to view this result");
            setPageLoading(false);
            return;
          }

          const resultData = {
            ...raw,
            completedAt: raw.completedAt?.toDate?.() || new Date(),
            answers: raw.answers || [],
          } as QuizResult;

          setResult(resultData);
          setPageLoading(false);
          // Update the URL to the real ID
          router.replace(`/result/${snap.id}`, { scroll: false });
          unsubscribe();
        }
      });

      return () => unsubscribe();
    } else {
      const fetchResult = async () => {
        try {
          const snap = await getDoc(doc(db, "results", resultId));
          if (!snap.exists()) {
            setError("Result not found");
            setPageLoading(false);
            return;
          }
          const raw = snap.data();
          if (raw.userId !== user.uid) {
            setError("You don't have permission to view this result");
            setPageLoading(false);
            return;
          }
          const resultData = {
            ...raw,
            completedAt: raw.completedAt?.toDate?.() || new Date(),
            answers: raw.answers || [],
          } as QuizResult;
          setResult(resultData);
        } catch (err: any) {
          setError(err.message || "Failed to load result.");
        } finally {
          setPageLoading(false);
        }
      };
      fetchResult();
    }
  }, [user, loading, resultId]);

  /* -------------------- Loading UI -------------------- */
  if (pageLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="mt-4 text-gray-600">Loading your quiz result...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
      </div>
    );
  }

  /* -------------------- Error UI -------------------- */
  if (error || !result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 text-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md w-full">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {error || "Unable to load result"}
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't load the requested quiz result. Please try again or return to the dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button 
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------- Calculations -------------------- */
  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  const passed = percentage >= 70;

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Quiz Results</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Score Card */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {passed ? (
                <Trophy className="h-16 w-16 text-yellow-500" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl font-bold">{percentage}%</span>
                </div>
              )}
            </div>
            <CardTitle className="text-3xl">
              {passed ? "Congratulations!" : "Keep Practicing!"}
            </CardTitle>
            <CardDescription>
              You scored {result.score} out of {result.totalQuestions}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Progress value={percentage} />
            <div className="flex justify-between">
              <Badge>{result.topic}</Badge>
              <Badge variant="secondary">{result.difficulty}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <Link href="/quiz/start" className="flex-1">
            <Button className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              New Quiz
            </Button>
          </Link>
          <Link href="/leaderboard" className="flex-1">
            <Button variant="outline" className="w-full">
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </Button>
          </Link>
        </div>

        {/* Question Review */}
        <h2 className="text-2xl font-bold mb-4">Question Review</h2>

        {result.answers.length === 0 ? (
          <p className="text-gray-500">Questions not available.</p>
        ) : (
          result.answers.map((q, index) => (
            <Card key={index} className="mb-4">
              <CardHeader>
                <CardTitle>
                  Q{index + 1}. {q.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {q.options.map((opt, i) => {
                  const isCorrect = i === q.correctAnswer;
                  const isUser = i === q.userAnswer;

                  return (
                    <div
                      key={i}
                      className={`p-3 my-2 rounded border ${
                        isCorrect
                          ? "bg-green-50 border-green-200"
                          : isUser
                          ? "bg-red-50 border-red-200"
                          : "bg-gray-50"
                      } flex justify-between items-center`}
                    >
                      <span>{opt}</span>
                      {isCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {isUser && !isCorrect && <XCircle className="h-4 w-4 text-red-600" />}
                    </div>
                  );
                })}
                {q.explanation && (
                  <div className="bg-blue-50 p-3 rounded text-sm mt-2">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
