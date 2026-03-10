'use client';

import { useEffect, useState } from 'react';
import { getQuizAttempts, QuizAttemptRecord } from '@/lib/learning';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Trophy, Calendar, Clock, Loader2, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuizHistory() {
  const [attempts, setAttempts] = useState<QuizAttemptRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const data = await getQuizAttempts();
      setAttempts(data);
      setIsLoading(false);
    };
    loadHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-slate-500 px-4">
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-violet-600 mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base font-semibold text-center">Loading your assessment history...</p>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="rounded-2xl sm:rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 sm:p-12 text-center mx-4 sm:mx-0">
        <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">No assessments yet</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 sm:mt-2">Complete a quiz in your courses to see your results here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4 sm:mb-6">Assessment History</h2>
      
      {attempts.map((attempt) => {
        const isExpanded = expandedId === attempt.id;
        const correctCount = attempt.responses.filter(r => r.is_correct).length;
        const totalQuestions = attempt.responses.length;
        const date = new Date(attempt.start_time).toLocaleDateString(undefined, { 
          month: 'short', day: 'numeric', year: 'numeric' 
        });

        return (
          <div key={attempt.id} className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-300">
            <div 
              onClick={() => setExpandedId(isExpanded ? null : attempt.id)}
              className="p-4 sm:p-5 lg:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 cursor-pointer hover:bg-slate-50 transition-colors active:bg-slate-100/50 sm:active:bg-slate-50"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate pr-2">{attempt.quiz_title || 'Assessment'}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:gap-4 text-[10px] sm:text-xs font-semibold text-slate-500 mt-1 sm:mt-1.5">
                    <span className="flex items-center gap-1 shrink-0"><Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {date}</span>
                    <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                    <span className="flex items-center gap-1 shrink-0"><CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" /> {correctCount} / {totalQuestions} Correct</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 shrink-0">
                <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-0">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider md:mb-0.5">Total Score</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 leading-none">{attempt.total_score}</p>
                </div>
                <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-slate-200 bg-slate-50/50 p-4 sm:p-6 lg:p-8 animate-in-scale origin-top">
                <h4 className="font-bold text-sm sm:text-base text-slate-900 mb-4 sm:mb-6">Detailed Review</h4>
                <div className="space-y-3 sm:space-y-4">
                  {attempt.responses.map((resp, i) => (
                    <div key={resp.id} className={cn(
                      "p-4 sm:p-5 rounded-xl sm:rounded-2xl border flex flex-col sm:flex-row gap-2.5 sm:gap-4",
                      resp.is_correct ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100"
                    )}>
                      <div className="shrink-0 flex items-center sm:items-start gap-2 sm:gap-0 sm:mt-1">
                        {resp.is_correct ? (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                        ) : resp.selected_option ? (
                          <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
                        ) : (
                          <MinusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" /> 
                        )}
                        <span className="sm:hidden text-[10px] font-bold text-slate-500 uppercase tracking-wider">Question {i + 1}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="hidden sm:block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Question {i + 1}</p>
                        <p className="text-sm sm:text-base text-slate-900 font-semibold mb-2 sm:mb-3 leading-snug break-words">{resp.question_text}</p>
                        <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2 text-xs sm:text-sm bg-white/60 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none">
                          <span className="text-slate-500 shrink-0">Your answer:</span>
                          <span className={cn(
                            "font-bold break-words", 
                            resp.is_correct ? "text-emerald-700" : resp.selected_option ? "text-rose-700" : "text-slate-500"
                          )}>
                            {resp.selected_option_text || 'Skipped'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}