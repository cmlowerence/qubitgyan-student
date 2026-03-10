'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { BookOpen, Clock, Target, ArrowRight, PlayCircle, AlertCircle, BarChart2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizOption {
  id?: number;
  text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id?: number;
  text: string;
  image_url?: string | null;
  marks_positive: number;
  marks_negative: number;
  order: number;
  options: QuizOption[];
}

interface QuizSummary {
  id: number;
  resource_id?: number; 
  resource_title?: string;      
  description?: string;
  time_limit_minutes: number;
  passing_score_percentage: number;
  questions: QuizQuestion[];
  is_completed?: boolean;
  latest_attempt_id?: number; 
}

export default function QuizzesListPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get('/public/quizzes/'); 
        const quizData = Array.isArray(data) ? data : data.results || [];
        setQuizzes(quizData);
      } catch (err) {
        setError('Failed to load available assessments. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] space-y-4 sm:space-y-5 px-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold tracking-widest animate-pulse uppercase text-xs sm:text-sm text-center">Loading Assessments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] px-4">
        <div className="p-6 sm:p-8 text-center max-w-lg w-full bg-white rounded-3xl sm:rounded-[2rem] border border-rose-100 shadow-xl shadow-rose-900/5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Connection Error</h2>
          <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-8 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-3.5 sm:py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-16">
      <div className="mb-8 sm:mb-12 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs sm:text-sm font-bold mb-3 sm:mb-4 border border-indigo-100">
          <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Assessment Center
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-3 sm:mb-4 tracking-tight">Available Quizzes</h1>
        <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed">
          Test your knowledge, identify your weak points, and track your progress across your learning modules.
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-16 sm:py-24 px-4 bg-white border border-slate-200 rounded-3xl sm:rounded-[2.5rem] shadow-sm">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto mb-5 sm:mb-6">
            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">No assessments available</h3>
          <p className="text-sm sm:text-base text-slate-500 font-medium">Check back later as new mock tests are added to your modules.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {quizzes.map((quiz) => {
            const questionCount = quiz.questions?.length || 0;

            return (
              <div 
                key={quiz.id} 
                className="group bg-white border border-slate-200 rounded-3xl sm:rounded-[2rem] p-5 sm:p-6 lg:p-8 flex flex-col shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 hover:border-indigo-200 transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-5 sm:mb-6 relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                    <PlayCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  {quiz.is_completed && (
                    <span className="bg-emerald-50 text-emerald-700 text-[9px] sm:text-[10px] font-black tracking-widest uppercase px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg border border-emerald-200 shadow-sm shrink-0 mt-1 sm:mt-0">
                      Completed
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3 line-clamp-2 leading-snug relative z-10">
                  {quiz.resource_title || `Assessment #${quiz.id}`}
                </h3>
                
                {quiz.description && (
                  <p className="text-slate-500 text-xs sm:text-sm mb-5 sm:mb-6 line-clamp-2 flex-grow font-medium leading-relaxed relative z-10">
                    {quiz.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-2 mb-6 sm:mb-8 mt-auto pt-5 sm:pt-6 border-t border-slate-100 relative z-10">
                  <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-slate-600">
                    <div className="p-1 sm:p-1.5 bg-slate-50 rounded-md sm:rounded-lg shrink-0"><Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" /></div>
                    <span className="font-bold truncate">{quiz.time_limit_minutes} mins</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-slate-600">
                    <div className="p-1 sm:p-1.5 bg-slate-50 rounded-md sm:rounded-lg shrink-0"><Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" /></div>
                    <span className="font-bold truncate">{quiz.passing_score_percentage}% Pass</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-slate-600 col-span-2">
                    <div className="p-1 sm:p-1.5 bg-slate-50 rounded-md sm:rounded-lg shrink-0"><BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" /></div>
                    <span className="font-bold truncate">{questionCount} Questions</span>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col gap-2.5 sm:gap-3">
                  {quiz.is_completed ? (
                    <>
                      {quiz.latest_attempt_id && (
                        <Link 
                          href={`/quiz/result?attempt_id=${quiz.latest_attempt_id}`} 
                          className="w-full py-3 sm:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-sm sm:text-base active:scale-[0.98]"
                        >
                          <BarChart2 className="w-4 h-4" /> Review Results
                        </Link>
                      )}
                      
                      <Link 
                        href={`/quiz/attempt?id=${quiz.id}`} 
                        className={cn(
                          "w-full py-3 sm:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm sm:text-base",
                          quiz.latest_attempt_id 
                            ? "bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            : "bg-slate-900 text-white hover:bg-indigo-600 shadow-md"
                        )}
                      >
                        <RotateCcw className="w-4 h-4" /> Retake Assessment
                      </Link>
                    </>
                  ) : (
                    <Link 
                      href={`/quiz/attempt?id=${quiz.id}`} 
                      className="w-full py-3 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-indigo-600 shadow-lg shadow-slate-900/10 hover:shadow-indigo-600/25 transition-all active:scale-[0.98] text-sm sm:text-base"
                    >
                      Start Assessment <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                  )}
                </div>

                <div className="absolute -bottom-16 -right-16 sm:-bottom-24 sm:-right-24 w-32 h-32 sm:w-48 sm:h-48 bg-indigo-50 rounded-full blur-2xl sm:blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}