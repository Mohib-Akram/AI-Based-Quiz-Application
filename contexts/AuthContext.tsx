"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface UserData {
  name:string
  uid: string
  email: string
  role: "user" | "admin"
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            // Document exists, normal flow
            setUserData(userDoc.data() as UserData);
            setUser(firebaseUser);
          } else {
            // Document doesn't exist, create it
            console.warn("User document not found. Creating a new one.");
            const newUser: UserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || "New User",
              role: "user",
              createdAt: new Date(),
            };
            await setDoc(userDocRef, newUser);
            setUserData(newUser);
            setUser(firebaseUser);
          }
        } else {
          // User is not logged in
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setUser(null);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  // This value is passed to consuming components
  const value = { user, userData, loading, logout };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
