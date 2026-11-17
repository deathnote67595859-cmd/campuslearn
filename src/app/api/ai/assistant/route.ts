import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Groq from 'groq-sdk';
import { authOptions } from '@/lib/auth';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Groq model to use for all CampusAI requests.
// Updated: llama-3.3-70b-versatile was retired for free-tier keys (Aug 2026).
// Using openai/gpt-oss-120b — OpenAI's open-weight 120B model hosted on Groq.
const GROQ_MODEL = 'openai/gpt-oss-120b';

export async function POST(req: Request) {
  try {
    // 1. Enforce Server-Side Authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be signed in to access the CampusAI Study Assistant.' },
        { status: 401 }
      );
    }

    // 2. Validate Service API Key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Groq API Key is missing. Please configure GROQ_API_KEY in environment variables.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { mode, noteTitle, subject, topic, summary, userMessage, chatHistory } = body;

    const systemPrompt = `You are CampusAI, an elite academic mentor and study assistant integrated into CampusNotes (a student handwritten note sharing web application). 
Your mission is to help university students master STEM and academic subjects (C++, Calculus, Quantum Physics, Computer Networks, Data Structures, etc.).
Keep your explanations precise, encouraging, well-structured in Markdown, and directly applicable to student exams and problem sets.`;

    if (mode === 'summary') {
      const prompt = `Analyze this lecture topic or note and generate a high-impact study guide summary:
Subject: ${subject || 'Computer Science & Engineering'}
Course Topic: ${topic || 'Core Academic'}
Note Title: ${noteTitle || 'Lecture Key Takeaways'}
Note Content/Summary: ${summary || 'Essential definitions, theorems, formulas, and concepts.'}

Please output standard Markdown with:
1. 🎯 **Key Concept Highlights** (3-4 bullet points)
2. 📐 **Core Formulas / Syntax Rules** (Code or Math formulas)
3. ⚡ **Exam & Problem Set Gotchas** (Common student traps to avoid)
4. 📝 **Quick Self-Check Question**`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        model: GROQ_MODEL,
        temperature: 0.3,
        max_tokens: 1024,
      });

      const responseText = chatCompletion.choices[0]?.message?.content || 'Unable to generate summary.';
      return NextResponse.json({ result: responseText });
    }

    if (mode === 'quiz') {
      const prompt = `Generate a 3-question Practice Exam Quiz based on:
Subject: ${subject || 'Computer Science & Engineering'}
Topic: ${topic || 'Core STEM & Academic Concepts'}
Title: ${noteTitle || 'Comprehensive Study Assessment'}
Details: ${summary || 'Rigorous college-level multiple choice questions testing fundamental principles.'}

Format your output clearly in JSON structure:
[
  {
    "id": 1,
    "question": "Clear exam question text...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation of why this answer is correct."
  }
]
Return ONLY valid JSON array without extra conversational text.`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You generate structured JSON quizzes for college students.' },
          { role: 'user', content: prompt },
        ],
        model: GROQ_MODEL,
        temperature: 0.4,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      });

      const rawText = chatCompletion.choices[0]?.message?.content || '{}';
      try {
        const parsed = JSON.parse(rawText);
        // Handle wrapper object if present
        const quizList = Array.isArray(parsed) ? parsed : parsed.questions || parsed.quiz || [];
        return NextResponse.json({ quiz: quizList, raw: rawText });
      } catch {
        return NextResponse.json({ raw: rawText, quiz: [] });
      }
    }

    // Default: Chat mode
    const contextNote = noteTitle
      ? `Context Note: "${noteTitle}" (${subject || 'General'} - ${topic || 'General'}). Summary: ${summary || 'None'}`
      : 'Context: General Academic & STEM Study Assistance across University Courses.';

    const messages = [
      { role: 'system', content: `${systemPrompt}\n${contextNote}` },
      ...(chatHistory || []).map((msg: { role: 'user' | 'assistant'; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: userMessage || 'Help me understand this topic.' },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: GROQ_MODEL,
      temperature: 0.5,
      max_tokens: 1024,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || 'No response from AI.';
    return NextResponse.json({ result: responseText });
  } catch (error: any) {
    console.error('Groq AI API Error:', error);

    // Produce a user-friendly error message instead of raw API dump
    let userMessage = 'The AI study assistant encountered an unexpected error. Please try again in a moment.';
    const status = error?.status || error?.statusCode || 500;

    if (status === 404 || (error?.message && error.message.includes('does not exist'))) {
      userMessage = 'The AI model is temporarily unavailable. Our team has been notified. Please try again later.';
    } else if (status === 429) {
      userMessage = 'The AI assistant is receiving too many requests right now. Please wait a minute and try again.';
    } else if (status === 401 || status === 403) {
      userMessage = 'AI service authentication failed. Please contact the administrator.';
    } else if (error?.message && error.message.includes('timeout')) {
      userMessage = 'The AI request timed out. Please try a shorter question or try again.';
    }

    return NextResponse.json(
      { error: userMessage },
      { status: status >= 400 && status < 600 ? status : 500 }
    );
  }
}
