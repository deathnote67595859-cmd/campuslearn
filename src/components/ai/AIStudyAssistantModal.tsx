'use client';

import React, { useState, useEffect } from 'react';
import { NoteItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  Sparkles,
  X,
  Send,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Bot,
  User,
  Zap,
  RefreshCw,
  Award,
} from 'lucide-react';

interface AIStudyAssistantModalProps {
  note?: NoteItem | null;
  isOpen: boolean;
  onClose: () => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const AIStudyAssistantModal: React.FC<AIStudyAssistantModalProps> = ({
  note = null,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'chat'>(note ? 'summary' : 'chat');
  
  // Summary State
  const [summaryText, setSummaryText] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: note
        ? `Hello! I'm **CampusAI**, powered by Groq Llama-3. Ask me any question about **${note.title}** or request a problem solution!`
        : `Hello! I'm **CampusAI**, your real-time academic assistant powered by Groq Llama-3. Ask me any question about your courses, engineering concepts, code problems, or exam preparations!`,
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [loadingChat, setLoadingChat] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (note) {
        setChatMessages([
          {
            role: 'assistant',
            content: `Hello! I'm **CampusAI**, powered by Groq Llama-3. Ask me any question about **${note.title}** or request a problem solution!`,
          },
        ]);
        setActiveTab('summary');
        if (!summaryText) {
          fetchSummary();
        }
      } else {
        setChatMessages([
          {
            role: 'assistant',
            content: `Hello! I'm **CampusAI**, your real-time academic mentor powered by Groq Llama-3.\n\nAsk me any question about your courses, engineering concepts, code problems, or exam preparations!`,
          },
        ]);
        setActiveTab('chat');
      }
    }
  }, [isOpen, note]);

  if (!isOpen) return null;

  // Fetch Summary
  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'summary',
          noteTitle: note?.title || 'Core Academic Topics',
          subject: note?.subject || 'STEM',
          topic: note?.topic || 'General',
          summary: note?.summary || '',
        }),
      });
      const data = await res.json();
      if (data.result) {
        setSummaryText(data.result);
      } else {
        setSummaryText(data.error || 'Failed to generate AI summary.');
      }
    } catch {
      setSummaryText('Error connecting to Groq AI service.');
    } finally {
      setLoadingSummary(false);
    }
  };

  // Fetch Quiz
  const fetchQuiz = async () => {
    setLoadingQuiz(true);
    setQuizScore(null);
    setUserAnswers({});
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'quiz',
          noteTitle: note?.title || 'Comprehensive Concept Check',
          subject: note?.subject || 'Computer Science & Engineering',
          topic: note?.topic || 'Core STEM Foundations',
          summary: note?.summary || '',
        }),
      });
      const data = await res.json();
      if (data.quiz && data.quiz.length > 0) {
        setQuizQuestions(data.quiz);
      } else {
        setQuizQuestions([]);
      }
    } catch {
      setQuizQuestions([]);
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Handle Quiz Option Selection
  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    setQuizScore(score);
  };

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || loadingChat) return;

    const userMsg = inputQuestion;
    setInputQuestion('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoadingChat(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat',
          noteTitle: note?.title || 'Campus Academic Knowledge Base',
          subject: note?.subject || 'Computer Science & Engineering',
          topic: note?.topic || 'Core Academic Concepts',
          summary: note?.summary || '',
          userMessage: userMsg,
          chatHistory: chatMessages,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: data.result }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.error || 'Apologies, I encountered an issue generating a response.' },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Apologies, I hit a network glitch. Please try asking again!' },
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#23211F]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-2xl border border-[#D5C9BA] shadow-soft-lg w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5DDD2] bg-[#F4EFEA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2D2A26] text-[#FAF7F2] flex items-center justify-center shadow-soft-xs">
              <Sparkles className="w-4.5 h-4.5 text-[#D4A359]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold text-[#23211F]">
                  {note ? 'Campus Study Companion' : 'CampusAI Study Assistant'}
                </h2>
                <span className="text-[10px] font-sans font-medium bg-[#E8E1D5] text-[#5A554E] px-2 py-0.5 rounded">
                  Groq Llama-3
                </span>
              </div>
              <p className="text-xs text-[#7A756D] line-clamp-1">
                {note
                  ? `Context: ${note.title} (${note.courseCode})`
                  : 'Campus-wide academic mentor, exam prep & concept solver'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#D5C9BA] bg-white hover:bg-[#FAF7F2] text-[#5A554E] hover:text-[#23211F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="bg-[#FAF7F2] border-b border-[#E5DDD2] flex divide-x divide-[#E5DDD2]">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'summary'
                ? 'bg-white text-[#23211F] font-semibold border-b-2 border-b-[#2D2A26]'
                : 'text-[#7A756D] hover:text-[#23211F] hover:bg-white/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#5A554E]" /> Key Takeaways
          </button>
          <button
            onClick={() => {
              setActiveTab('quiz');
              if (quizQuestions.length === 0) fetchQuiz();
            }}
            className={`flex-1 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'quiz'
                ? 'bg-white text-[#23211F] font-semibold border-b-2 border-b-[#2D2A26]'
                : 'text-[#7A756D] hover:text-[#23211F] hover:bg-white/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#5A554E]" /> Practice Check
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-white text-[#23211F] font-semibold border-b-2 border-b-[#2D2A26]'
                : 'text-[#7A756D] hover:text-[#23211F] hover:bg-white/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#5A554E]" /> Inquire with Mentor
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FAF7F2]">
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-[#E5DDD2] shadow-soft-xs">
                <span className="text-xs text-[#5A554E]">
                  {note
                    ? 'Synthesizing key formulas and core proofs from this handwritten folio...'
                    : 'Synthesizing key formulas and exam principles for core university courses...'}
                </span>
                <Button variant="outline" size="sm" onClick={fetchSummary} disabled={loadingSummary} className="text-xs">
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loadingSummary ? 'animate-spin' : ''}`} /> {summaryText ? 'Re-analyze' : 'Synthesize Guide'}
                </Button>
              </div>

              {loadingSummary ? (
                <div className="p-12 text-center bg-white rounded-xl border border-[#E5DDD2] shadow-soft space-y-3">
                  <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#D5C9BA] flex items-center justify-center mx-auto animate-pulse">
                    <Sparkles className="w-4 h-4 text-[#D4A359]" />
                  </div>
                  <p className="text-xs font-medium text-[#7A756D]">Synthesizing handwritten concepts...</p>
                </div>
              ) : summaryText ? (
                <div className="bg-white p-6 rounded-xl border border-[#E5DDD2] shadow-soft space-y-3 text-xs text-[#2D2A26] leading-relaxed whitespace-pre-line font-sans">
                  {summaryText}
                </div>
              ) : (
                <div className="p-12 text-center bg-white rounded-xl border border-[#E5DDD2] shadow-soft space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#D5C9BA] text-[#5A554E] flex items-center justify-center mx-auto">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-serif font-bold text-[#23211F]">Generate Concept Study Guide</p>
                  <p className="text-xs text-[#7A756D] max-w-sm mx-auto">
                    Click &quot;Synthesize Guide&quot; above to generate a high-impact revision breakdown, or ask any concept in the mentor chat.
                  </p>
                  <Button variant="primary" size="sm" onClick={fetchSummary} className="text-xs mt-2">
                    Synthesize Guide
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI PRACTICE QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#E5DDD2] shadow-soft-xs">
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#23211F]">Concept Comprehension Check</h3>
                  <p className="text-xs text-[#7A756D]">
                    {note ? 'Test your understanding of the lecture principles' : 'Test your mastery of core STEM & Engineering concepts'}
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={fetchQuiz} disabled={loadingQuiz} className="text-xs">
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loadingQuiz ? 'animate-spin' : ''}`} /> New Questions
                </Button>
              </div>

              {loadingQuiz ? (
                <div className="p-12 text-center bg-white rounded-xl border border-[#E5DDD2] shadow-soft">
                  <p className="text-xs font-medium text-[#7A756D]">Composing tailored questions from lecture notes...</p>
                </div>
              ) : quizQuestions.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-xl border border-[#E5DDD2] shadow-soft space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#D5C9BA] text-[#5A554E] flex items-center justify-center mx-auto">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-serif font-bold text-[#23211F]">No Quiz Questions Generated Yet</p>
                  <p className="text-xs text-[#7A756D] max-w-sm mx-auto">
                    Click &quot;New Questions&quot; above to synthesize a real-time practice test.
                  </p>
                  <Button variant="primary" size="sm" onClick={fetchQuiz} className="text-xs mt-2">
                    Generate Practice Quiz
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizQuestions.map((q, qIdx) => (
                    <div key={q.id || qIdx} className="bg-white p-5 rounded-xl border border-[#E5DDD2] shadow-soft space-y-3">
                      <p className="text-sm font-serif font-semibold text-[#23211F]">
                        {qIdx + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswers[q.id || qIdx] === optIdx;
                          const isCorrect = quizScore !== null && optIdx === q.correctIndex;
                          const isWrong = quizScore !== null && isSelected && optIdx !== q.correctIndex;

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(q.id || qIdx, optIdx)}
                              className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                                isCorrect
                                  ? 'bg-[#EBF2EC] text-[#2D5A3A] border-[#CCDCCE] font-medium shadow-soft-xs'
                                  : isWrong
                                  ? 'bg-rose-50 text-[#B85450] border-rose-200'
                                  : isSelected
                                  ? 'bg-[#F4EFEA] text-[#2D2A26] border-[#2D2A26] shadow-soft-xs font-medium'
                                  : 'bg-white border-[#E5DDD2] text-[#5A554E] hover:bg-[#FAF7F2]'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {quizScore !== null && (
                        <p className="text-xs bg-[#FAF7F2] p-3 rounded-lg border border-[#E5DDD2] text-[#5A554E] leading-relaxed">
                          <strong className="text-[#2D2A26]">Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="pt-2 flex items-center justify-between">
                    {quizScore !== null ? (
                      <div className="p-3 bg-[#EBF2EC] text-[#2D5A3A] border border-[#CCDCCE] rounded-lg text-xs font-semibold flex items-center gap-2 shadow-soft-xs">
                        <Award className="w-4 h-4" /> Score: {quizScore} / {quizQuestions.length} correct
                      </div>
                    ) : (
                      <div></div>
                    )}
                    <Button variant="primary" size="md" onClick={handleSubmitQuiz} className="text-xs">
                      Verify Answers
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ASK AI CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[420px] bg-white rounded-xl border border-[#E5DDD2] shadow-soft overflow-hidden">
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF7F2]">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#D5C9BA] flex items-center justify-center text-[#2D2A26] shrink-0">
                        <Bot className="w-4 h-4 text-[#5A554E]" />
                      </div>
                    )}

                    <div
                      className={`max-w-md p-3 rounded-xl text-xs leading-relaxed whitespace-pre-line shadow-soft-xs ${
                        msg.role === 'user'
                          ? 'bg-[#2D2A26] text-[#FAF7F2] font-medium'
                          : 'bg-white text-[#2D2A26] border border-[#E5DDD2]'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#D5C9BA] flex items-center justify-center text-[#2D2A26] shrink-0">
                        <User className="w-4 h-4 text-[#5A554E]" />
                      </div>
                    )}
                  </div>
                ))}
                {loadingChat && (
                  <div className="flex items-center gap-2 text-xs text-[#7A756D]">
                    <Bot className="w-4 h-4 animate-spin text-[#5A554E]" /> Composing scholarly response...
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E5DDD2] bg-white flex gap-2">
                <Input
                  placeholder={note ? `Inquire regarding ${note.subject} concepts...` : "Ask any STEM, CS, or course concept question..."}
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  className="text-xs bg-[#FAF7F2]"
                />
                <Button type="submit" variant="primary" size="sm" disabled={loadingChat} className="text-xs">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
