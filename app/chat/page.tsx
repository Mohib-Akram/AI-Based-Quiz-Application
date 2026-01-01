"use client"
import { useEffect, useState } from "react"

export default function ExplanationPage() {
    const [chat, setChat] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const quizData = JSON.parse(sessionStorage.getItem("currentQuiz"))
        if (!quizData){
            console.log("there is no data")
        }

        const explainAnswers = async () => {
            const explanations = []

            for (const q of quizData.questions) {
                const response = await fetch("/api/explain-answer", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        question: q.question,
                        correctAnswer: q.correctAnswer,
                        userAnswer: q.userAnswer,
                        options: q.options,
                    }),
                })

                const data = await response.json()

                explanations.push({
                    question: q.question,
                    userAnswer: q.options[q.userAnswer],
                    correctAnswer: q.options[q.correctAnswer],
                    explanation: data.explanation,
                })
            }

            setChat(explanations)
            setLoading(false)
        }

        explainAnswers()
    }, [])
   if (loading) return <div className="p-6 text-center text-gray-600">🧠 Generating explanations...</div>
  // sessionStorage.removeItem("currentQuiz")
   
    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-semibold mb-6 text-center">💬 Quiz Answer Explanations</h2>
            <div className="space-y-6">
                {chat.map((item, index) => (
                    <div key={index} className="space-y-4">
                        {/* User Bubble */}
                        <div className="flex justify-end">
                            <div className="bg-blue-600 text-white p-3 rounded-xl max-w-md shadow-md text-sm">
                                <strong>You:</strong><br />
                                I selected "<em>{item.userAnswer}</em>" for:<br />
                                <span className="italic">{item.question}</span>
                            </div>
                        </div>

                        {/* AI Bubble */}
                        <div className="flex justify-start">
                            <div className="bg-gray-200 text-gray-800 p-3 rounded-xl max-w-md shadow text-sm">
                                <strong>AI Assistant:</strong><br />
                                {item.explanation}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
