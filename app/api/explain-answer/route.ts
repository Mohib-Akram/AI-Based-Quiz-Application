import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { question, userAnswer, correctAnswer, options } = await request.json()

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Explain why the user's answer is incorrect in a friendly and educational way.

Question: ${question}
Options: ${options.map((opt: string, idx: number) => `${idx + 1}. ${opt}`).join("\n")}
User's Answer: ${options[userAnswer]}
Correct Answer: ${options[correctAnswer]}

Provide a clear, concise explanation that:
1. Acknowledges their choice
2. Explains why the correct answer is right
3. Is encouraging and educational

Keep it under 50 words and make it friendly.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const explanation = response.text()

    return NextResponse.json({
      success: true,
      explanation: explanation.trim(),
    })
  } catch (error) {
    console.error("Error generating explanation:", error)
    return NextResponse.json({ success: false, error: "Failed to generate explanation" }, { status: 500 })
  }
}
