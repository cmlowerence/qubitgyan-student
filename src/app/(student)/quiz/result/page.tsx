'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Target, 
  Award, 
  ArrowLeft,
  Loader2,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizOption {
  id: number;
  text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id: number;
  text: string;
  image_url?: string | null;
  marks_positive: number;
  marks_negative: number;
  options: QuizOption[];
}

interface QuestionResponse {
  id: number;
  question: number;
  selected_option: number | null;
  is_correct: boolean;
}

interface QuizAttempt {
  id: number;
  quiz: number;
  quiz_title: string;
  total_score: number;
  responses: QuestionResponse[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bg: string;
  border: string;
  className?: string;
}

export default function QuizResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-indigo-600" />
      </div>
    }>
      <ResultEngine />
    </Suspense>
  );
}

function ResultEngine() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const attemptId = searchParams.get('attempt_id');

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) {
      setError('No attempt ID provided.');
      setIsLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const attemptRes = await api.get(`/public/quiz-attempts/${attemptId}/`);
        const attemptData = attemptRes.data;
        setAttempt(attemptData);

        const quizRes = await api.get(`/public/quizzes/${attemptData.quiz}/review/`);
        setQuestions(quizRes.data.questions);
      } catch (err) {
        setError('Could not load your results. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 space-y-4">
        <Loader2 className="w-10 h-10 md:w-12 md:h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-xs md:text-sm animate-pulse text-center">Analyzing Responses...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[2rem] border border-rose-100 shadow-xl max-w-md w-full text-center">
          <XCircle className="w-12 h-12 md:w-16 md:h-16 text-rose-500 mx-auto mb-3 md:mb-4" />
          <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-sm md:text-base text-slate-500 mb-6 md:mb-8">{error}</p>
          <button onClick={() => router.push('/courses')} className="w-full py-3.5 md:py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors active:scale-[0.98]">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const attemptedQuestions = attempt.responses.length;
  const correctAnswers = attempt.responses.filter(r => r.is_correct).length;
  const incorrectAnswers = attemptedQuestions - correctAnswers;
  const skippedQuestions = totalQuestions - attemptedQuestions;
  const accuracy = attemptedQuestions > 0 ? Math.round((correctAnswers / attemptedQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12 md:pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0 pr-4">
            <button onClick={() => router.push('/courses')} className="p-1.5 md:p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors shrink-0">
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="hidden sm:block border-l border-slate-200 h-6 md:h-8 mr-1 md:mr-2 shrink-0"></div>
            <h1 className="font-bold text-sm md:text-base text-slate-900 line-clamp-1 truncate">Performance Report</h1>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 bg-indigo-50 text-indigo-700 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-sm md:text-base shrink-0">
            <Award className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Score: </span>{attempt.total_score}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 md:pt-10 lg:pt-12">
        <div className="bg-white rounded-3xl md:rounded-[2rem] p-5 sm:p-8 md:p-10 border border-slate-200 shadow-sm mb-8 md:mb-10">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 leading-tight">{attempt.quiz_title}</h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium">Review your responses below to identify areas for improvement.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            <StatCard title="Total Score" value={attempt.total_score.toString()} icon={<Award className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" />} bg="bg-indigo-50" border="border-indigo-100" />
            <StatCard title="Accuracy" value={`${accuracy}%`} icon={<Target className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />} bg="bg-blue-50" border="border-blue-100" />
            <StatCard title="Correct" value={correctAnswers.toString()} icon={<CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />} bg="bg-emerald-50" border="border-emerald-100" />
            <StatCard title="Incorrect" value={incorrectAnswers.toString()} icon={<XCircle className="w-5 h-5 md:w-6 md:h-6 text-rose-500" />} bg="bg-rose-50" border="border-rose-100" />
            <StatCard title="Skipped" value={skippedQuestions.toString()} icon={<MinusCircle className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />} bg="bg-slate-50" border="border-slate-200" className="col-span-2 lg:col-span-4 max-w-sm mx-auto w-full" />
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <h3 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2 px-1">
            <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" /> Detailed Review
          </h3>

          {questions.map((question, index) => {
            const studentResponse = attempt.responses.find(r => r.question === question.id);
            const isSkipped = !studentResponse;
            const isCorrect = studentResponse?.is_correct;

            return (
              <div key={question.id} className="bg-white rounded-2xl md:rounded-[2rem] p-5 sm:p-6 md:p-8 border border-slate-200 shadow-sm">
                <div className="flex flex-wrap items-center justify-between mb-4 md:mb-6 gap-3">
                  <span className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest shrink-0">
                    Q {index + 1}
                  </span>
                  
                  {isSkipped ? (
                    <span className="bg-slate-100 text-slate-600 text-[10px] md:text-xs font-bold px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg flex items-center gap-1.5">
                      <MinusCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> Skipped
                    </span>
                  ) : isCorrect ? (
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] md:text-xs font-bold px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg flex items-center gap-1.5 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> Correct (+{question.marks_positive})
                    </span>
                  ) : (
                    <span className="bg-rose-100 text-rose-700 text-[10px] md:text-xs font-bold px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg flex items-center gap-1.5 border border-rose-200">
                      <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> Incorrect (-{question.marks_negative})
                    </span>
                  )}
                </div>

                <h4 className="text-base md:text-lg lg:text-xl font-medium text-slate-900 leading-snug mb-5 md:mb-6">
                  {question.text}
                </h4>
                {question.image_url && (
                  <div className="mb-5 md:mb-6 rounded-xl md:rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={question.image_url} alt="Question" className="w-full max-h-[250px] md:max-h-[300px] object-contain p-2 md:p-4" />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2.5 md:gap-3">
                  {question.options.map((option) => {
                    const isSelected = studentResponse?.selected_option === option.id;
                    const isActuallyCorrect = option.is_correct;
                    
                    let optionStyle = "bg-slate-50 border-slate-200 text-slate-600";
                    let Icon = null;

                    if (isSelected && isCorrect) {
                      optionStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm";
                      Icon = <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />;
                    } else if (isSelected && !isCorrect) {
                      optionStyle = "bg-rose-50 border-rose-500 text-rose-900 shadow-sm";
                      Icon = <XCircle className="w-4 h-4 md:w-5 md:h-5 text-rose-600" />;
                    } else if (!isSelected && isActuallyCorrect) {
                      optionStyle = "bg-emerald-50/50 border-emerald-300 text-emerald-800 border-dashed";
                      Icon = <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 opacity-50" />;
                    }

                    return (
                      <div
                        key={option.id}
                        className={cn(
                          "w-full text-left p-3.5 md:p-4 rounded-xl border-2 flex items-start sm:items-center justify-between transition-all",
                          optionStyle
                        )}
                      >
                        <span className={cn("text-sm md:text-base pr-3 md:pr-4 break-words leading-tight", isSelected ? "font-bold" : "font-medium")}>
                          {option.text}
                        </span>
                        {Icon && <div className="shrink-0 mt-0.5 sm:mt-0">{Icon}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, bg, border, className }: StatCardProps) {
  return (
    <div className={cn("p-4 sm:p-5 rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center text-center", bg, border, className)}>
      <div className="mb-2 p-1.5 sm:p-2 bg-white rounded-lg sm:rounded-xl shadow-sm">
        {icon}
      </div>
      <p className="text-xl sm:text-2xl font-black text-slate-900 mb-0.5 sm:mb-1">{value}</p>
      <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider line-clamp-1">{title}</p>
    </div>
  );
}