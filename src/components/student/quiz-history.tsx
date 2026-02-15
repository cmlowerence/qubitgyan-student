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
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600 mb-4" />
        <p className="font-semibold">Loading your assessment history...</p>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900">No assessments yet</h3>
        <p className="text-slate-500 mt-2">Complete a quiz in your courses to see your results here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-slate-900 mb-6">Assessment History</h2>
      
      {attempts.map((attempt) => {
        const isExpanded = expandedId === attempt.id;
        const correctCount = attempt.responses.filter(r => r.is_correct).length;
        const totalQuestions = attempt.responses.length;
        const date = new Date(attempt.start_time).toLocaleDateString(undefined, { 
          month: 'short', day: 'numeric', year: 'numeric' 
        });

        return (
          <div key={attempt.id} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-300">
            {/* Header / Summary Row */}
            <div 
              onClick={() => setExpandedId(isExpanded ? null : attempt.id)}
              className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{attempt.quiz_title || 'Assessment'}</h3>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {date}</span>
                    <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {correctCount} / {totalQuestions} Correct</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                <div className="text-center sm:text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Score</p>
                  <p className="text-2xl font-black text-slate-900">{attempt.total_score}</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-violet-100 hover:text-violet-600 transition-colors">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Expanded Detailed Review */}
            {isExpanded && (
              <div className="border-t border-slate-200 bg-slate-50/50 p-5 sm:p-8 animate-in-scale origin-top">
                <h4 className="font-bold text-slate-900 mb-6">Detailed Review</h4>
                <div className="space-y-4">
                  {attempt.responses.map((resp, i) => (
                    <div key={resp.id} className={cn(
                      "p-5 rounded-2xl border flex gap-4",
                      resp.is_correct ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100"
                    )}>
                      <div className="shrink-0 mt-1">
                        {resp.is_correct ? (
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                        ) : resp.selected_option ? (
                          <XCircle className="w-6 h-6 text-rose-600" />
                        ) : (
                          <MinusCircle className="w-6 h-6 text-slate-400" /> // For skipped questions
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Question {i + 1}</p>
                        <p className="text-slate-900 font-semibold mb-3">{resp.question_text}</p>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="text-slate-500">Your answer:</span>
                          <span className={cn(
                            "font-bold", 
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