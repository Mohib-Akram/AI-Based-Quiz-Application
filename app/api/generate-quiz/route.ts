import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load Gemini API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty, questionCount = 10 } = await request.json();

    const prompt = `Generate ${questionCount} multiple choice questions about "${topic}" at ${difficulty} difficulty level.

Format the response strictly as a JSON array like this:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this is correct"
  }
]

Make sure:
- Each question has exactly 4 options
- "correctAnswer" is an index (0 to 3)
- Include explanations
- Return ONLY valid JSON array, no markdown or extra text`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = result.response.text();

    // ✅ Match JSON block (non-greedy)
    const jsonMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from Gemini response");
    }

    // ✅ Clean trailing commas
    const rawJson = jsonMatch[0].replace(/,\s*([}\]])/g, "$1");

    // ✅ Safely parse JSON
    const questions = JSON.parse(rawJson);

    return NextResponse.json({
      success: true,
      questions,
      quizId: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { success: false, error: "Quiz generation failed" },
      { status: 500 }
    );
  }
}


// import { NextRequest, NextResponse } from "next/server";
// import { OpenAI } from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function POST(request: NextRequest) {
//   try {
//     const { topic, difficulty, questionCount = 10 } = await request.json();

//     const prompt = `Generate ${questionCount} multiple choice questions about ${topic} at ${difficulty} difficulty level.

// Format the response as a JSON array with this exact structure:
// [
//   {
//     "question": "Question text here",
//     "options": ["Option A", "Option B", "Option C", "Option D"],
//     "correctAnswer": 0,
//     "explanation": "Brief explanation of why this is correct"
//   }
// ]

// Make sure:
// - Each question has exactly 4 options
// - correctAnswer is the index (0-3)
// - Include explanations
// - Vary question styles`;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: prompt }],
//     });

//     const aiResponse = completion.choices[0].message?.content || "";
//     const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
//     if (!jsonMatch) {
//       throw new Error("Failed to extract JSON from AI response");
//     }

//     const questions = JSON.parse(jsonMatch[0]);

//     return NextResponse.json({
//       success: true,
//       questions,
//       quizId: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//     });

//   } catch (error) {
//     console.error("Quiz generation error:", error);

//     // Fallback: 5 hardcoded questions
//     const fallbackQuestions = [
//       {
//         question: "What is the capital of France?",
//         options: ["Berlin", "London", "Paris", "Rome"],
//         correctAnswer: 2,
//         explanation: "Paris is the capital city of France.",
//       },
//       {
//         question: "Which planet is known as the Red Planet?",
//         options: ["Earth", "Mars", "Jupiter", "Venus"],
//         correctAnswer: 1,
//         explanation: "Mars is known as the Red Planet due to its reddish appearance.",
//       },
//       {
//         question: "What is 5 + 7?",
//         options: ["10", "11", "12", "13"],
//         correctAnswer: 2,
//         explanation: "5 + 7 equals 12.",
//       },
//       {
//         question: "Who wrote 'Romeo and Juliet'?",
//         options: ["Charles Dickens", "William Shakespeare", "Leo Tolstoy", "Jane Austen"],
//         correctAnswer: 1,
//         explanation: "William Shakespeare wrote 'Romeo and Juliet'.",
//       },
//       {
//         question: "Which gas do plants absorb from the atmosphere?",
//         options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
//         correctAnswer: 1,
//         explanation: "Plants absorb carbon dioxide for photosynthesis.",
//       },
//     ];

//     return NextResponse.json({
//       success: true,
//       questions: fallbackQuestions,
//       quizId: `quiz_fallback_${Date.now()}`,
//       fallback: true,
//     });
//   }
// }
