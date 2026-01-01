"use client"

import type React from "react"
import { useState } from "react"
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Brain, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { updateProfile } from "firebase/auth"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const createUserProfile = async (uid: string, email: string, name: string) => {
    await setDoc(doc(db, "users", uid), {
      name,
      email,
      role: "user",
      createdAt: new Date(),
      totalQuizzes: 0,
      averageScore: 0,
    })
  }


const handleEmailSignup = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    // ✅ Set displayName in Firebase Auth
    await updateProfile(userCredential.user, {
      displayName: name,
    })

    // ✅ Store name in Firestore
    await createUserProfile(userCredential.user.uid, email, name)

    toast({
      title: "Welcome to AI Quiz Pro!",
      description: "Your account has been created successfully.",
    })

    router.push("/dashboard")
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}


  const handleGoogleSignup = async () => {
    setLoading(true)
    const provider = new GoogleAuthProvider()

    try {
      const result = await signInWithPopup(auth, provider)
      await createUserProfile(result.user.uid, result.user.email!, result.user.displayName || "Unnamed User")

      toast({
        title: "Welcome to AI Quiz Pro!",
        description: "Your account has been created successfully.",
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Brain className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join AI Quiz Pro and start your learning journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full bg-transparent" onClick={handleGoogleSignup} disabled={loading}>
            <Mail className="mr-2 h-4 w-4" />
            Google
          </Button>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
