"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Brain,
  ShieldCheck,
  BarChart3,
  Trophy,
  Github,
  Linkedin,
  Twitter,
  Menu,
  X,
  Users,
  Target,
  Zap,
  Award,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
              {["Start Quiz", "Result", "Leaderboard", "About"].map(
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

            {/* Desktop Login Button */}
            <div className="hidden md:block">
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow"
              >
                <Link href="/login">Login</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200">
              <div className="max-w-7xl mx-auto px-6 py-4 space-y-3">
                {["Start Quiz", "Result", "Leaderboard", "About"].map(
                  (item, i) => (
                    <Link
                      key={i}
                      href={
                        item === "Start Quiz"
                          ? "/quiz/start"
                          : `/${item.toLowerCase().replace(" ", "")}`
                      }
                      className="block py-2 text-gray-700 font-medium hover:text-blue-600 transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  )
                )}
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 text-gray-700 font-medium hover:text-blue-600 transition"
                >
                  Login
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {/* Hero Section */}
          <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
            <div className="text-center space-y-8">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                About <span className="text-blue-600">AI Quiz Pro</span>
              </h1>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                We're revolutionizing online learning with AI-powered quizzes that adapt to your skills, 
                ensure academic integrity, and provide detailed analytics for optimal learning outcomes.
              </p>
            </div>
          </section>

          {/* Mission Section */}
          <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
            <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-blue-600">Our Mission</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    At AI Quiz Pro, we believe in making education more accessible, engaging, and effective 
                    through cutting-edge artificial intelligence. Our platform is designed to create personalized 
                    learning experiences that adapt to each student's unique needs and pace.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    We combine advanced AI technology with robust monitoring systems to ensure fair assessment 
                    while providing valuable insights that help students and educators track progress and identify 
                    areas for improvement.
                  </p>
                </div>
                <div className="flex justify-center">
                  <Target className="h-64 w-64 text-blue-600 opacity-20" />
                </div>
              </div>
            </div>
          </section>

          {/* Core Values */}
          <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">Our Core Values</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <Lightbulb />,
                  title: "Innovation",
                  desc: "Continuously pushing the boundaries of AI in education.",
                  color: "bg-yellow-100 text-yellow-600",
                },
                {
                  icon: <ShieldCheck />,
                  title: "Integrity",
                  desc: "Ensuring fair and honest assessment through advanced monitoring.",
                  color: "bg-green-100 text-green-600",
                },
                {
                  icon: <Users />,
                  title: "Accessibility",
                  desc: "Making quality education available to everyone, everywhere.",
                  color: "bg-blue-100 text-blue-600",
                },
                {
                  icon: <Award />,
                  title: "Excellence",
                  desc: "Committed to delivering the best learning experience possible.",
                  color: "bg-purple-100 text-purple-600",
                },
              ].map((value, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-md hover:shadow-xl transition hover:-translate-y-1"
                >
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-full mb-4 ${value.color}`}
                  >
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Technology Stack */}
          <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
            <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold mb-8 text-center">Powered by Advanced Technology</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">AI Question Generation</h3>
                  <p className="text-gray-600">
                    Our sophisticated AI algorithms generate questions tailored to different difficulty levels 
                    and subject areas, ensuring a comprehensive learning experience.
                  </p>
                </div>
                <div className="text-center">
                  <Zap className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Real-time Monitoring</h3>
                  <p className="text-gray-600">
                    Advanced web monitoring systems detect suspicious activities and ensure academic integrity 
                    during quiz sessions.
                  </p>
                </div>
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-600">
                    Comprehensive analytics provide detailed insights into performance, progress, and areas 
                    for improvement.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          {/* <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">Meet Our Team</h2>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8">
              {[
                {
                  name: "Muhammad Danish",
                  role: "Full-Stack Developer",
                  desc: "Expert in React, Next.js, and AI integration. Passionate about creating seamless user experiences.",
                  color: "bg-blue-100 text-blue-600",
                },
                {
                  name: "Mohib Akram",
                  role: "AI/ML Engineer",
                  desc: "Specializes in machine learning algorithms and AI-powered educational technology solutions.",
                  color: "bg-green-100 text-green-600",
                },
                {
                  name: "Taha Haider",
                  role: "Backend Developer",
                  desc: "Focused on building robust server architecture and database management systems.",
                  color: "bg-purple-100 text-purple-600",
                },
              ].map((team, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-md hover:shadow-xl transition w-full md:w-80 lg:w-72"
                >
                  <div
                    className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 ${team.color} mx-auto`}
                  >
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-2">{team.name}</h3>
                  <p className="text-sm text-blue-600 text-center mb-3">{team.role}</p>
                  <p className="text-sm text-gray-600 text-center">{team.desc}</p>
                </div>
              ))}
            </div>
          </section> */}

          {/* CTA Section */}
          <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-12 rounded-2xl text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Learning?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of students already using AI Quiz Pro to enhance their learning experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-6 rounded-full"
                >
                  <Link href="/signup">Get Started Free</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                //   variant="outline"
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-6 rounded-full"
            
                >
                  <Link href="/quiz/start">Try a Demo Quiz</Link>
                </Button>
              </div>
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
