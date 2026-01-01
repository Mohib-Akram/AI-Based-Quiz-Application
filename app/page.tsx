"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Brain,
  ShieldCheck,
  BarChart3,
  Trophy,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-gray-900">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/60" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold">AI Quiz Pro</span>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
              {["Start Quiz", "Quiz Results", "Leaderboard", "About"].map(
                (item, i) => (
                  <Link
                    key={i}
                    href={
                      item === "Start Quiz"
                        ? "/quiz/start"
                        : `/${item.toLowerCase().replace(" ", "")}`
                    }
                    className="hover:text-blue-600 transition"
                  >
                    {item}
                  </Link>
                )
              )}
            </nav>

            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow"
            >
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </header>

        {/* Hero */}
        <main className="flex-1">
          <section className="max-w-7xl mx-auto px-6 md:px-10 py-24 grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                Online <span className="text-blue-600">AI Quiz</span> Platform
              </h1>

              <p className="text-lg text-gray-700 max-w-xl mx-auto md:mx-0">
                AI-powered quizzes that adapt to your skills, monitor activity,
                analyze results, and rank users in real time.
              </p>

              <Button
                asChild
                size="lg"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition"
              >
                <Link href="/signup">Start Quiz Now</Link>
              </Button>
            </div>

            <div className="flex justify-center">
              <Image
                src="/quiz-illustration.png"
                alt="AI Quiz Illustration"
                width={420}
                height={420}
                priority
                className="w-full max-w-md drop-shadow-2xl scale-105"
              />
            </div>
          </section>

          {/* Features */}
          <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
              Powerful Features
            </h2>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <Brain />,
                  title: "AI Question Generation",
                  desc: "Smart AI-generated questions based on difficulty and topic.",
                  color: "bg-blue-100 text-blue-600",
                },
                {
                  icon: <ShieldCheck />,
                  title: "Web Detection",
                  desc: "Detect tab switching and suspicious activity during quizzes.",
                  color: "bg-green-100 text-green-600",
                },
                {
                  icon: <Trophy />,
                  title: "Leaderboard",
                  desc: "Real-time rankings to motivate competitive learning.",
                  color: "bg-purple-100 text-purple-600",
                },
                {
                  icon: <BarChart3 />,
                  title: "Analytics & Results",
                  desc: "Detailed reports and performance analytics for users.",
                  color: "bg-yellow-100 text-yellow-600",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-md hover:shadow-xl transition hover:-translate-y-1"
                >
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-full mb-4 ${f.color}`}
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-xl border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-14 grid gap-10 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-7 w-7 text-blue-600" />
                <h3 className="text-xl font-bold">AI Quiz Pro</h3>
              </div>
              <p className="text-sm text-gray-600">
                Smart AI-based quiz system with monitoring, analytics, and
                competitive ranking.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/quiz/start">Start Quiz</Link></li>
                <li><Link href="/leaderboard">Leaderboard</Link></li>
                <li><Link href="/result">Results</Link></li>
                <li><Link href="/about">About</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>AI Question Generator</li>
                <li>Web Monitoring</li>
                <li>Leaderboard</li>
                <li>Analytics</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex gap-4 text-gray-600">
                <Github className="hover:text-blue-600 cursor-pointer" />
                <Linkedin className="hover:text-blue-600 cursor-pointer" />
                <Twitter className="hover:text-blue-600 cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 py-4 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} AI Quiz Pro. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
