'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { BookOpen, Clock, Target, ArrowRight, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Extending your previous Quiz interface slightly to accommodate listing data
// (You might need to adjust these fields based on what your API actually returns for lists)
interface QuizSummary {
  id: number;
  resource_id: number; // The ID we need to pass to the viewer
  title: string;       // Usually comes from the resource or quiz itself
  description?: string;
  time_limit_minutes: number;
  passing_score_percentage: number;
  question_count: number;
  is_completed?: boolean;
}

export default function QuizzesListPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        // Adjust this endpoint to wherever your backend lists all accessible quizzes
        const { data } = await api.get('/public/quizzes/'); 
        
        // Assuming your API wraps lists in a 'results' array, similar to your extractList utility
        const quizData = Array.isArray(data) ? data : data.results || [];
        setQuizzes(quizData);
      } catch (err) {
        console.error('Failed to load quizzes:', err);
        setError('Failed to load available quizzes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading your assessments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto mt-10 bg-rose-50 rounded-3xl border border-rose-100">
        <p className="text-rose-600 font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 mb-3">Available Assessments</h1>
        <p className="text-lg text-slate-500">Test your knowledge and track your progress across your courses.</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-3xl">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No quizzes available yet</h3>
          <p className="text-slate-500">Check back later for new assessments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div 
              key={quiz.id} 
              className="group bg-white border border-slate-200 rounded-3xl p-6 flex flex-col shadow-sm hover:shadow-xl hover:border-violet-300 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-6 h-6" />
                </div>
                {quiz.is_completed && (
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                    Completed
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                {quiz.title || `Assessment #${quiz.id}`}
              </h3>
              
              {quiz.description && (
                <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-grow">
                  {quiz.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 mb-6 mt-auto pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold">{quiz.time_limit_minutes} mins</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Target className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold">{quiz.passing_score_percentage}% to pass</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 col-span-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold">{quiz.question_count} Questions</span>
                </div>
              </div>

              {/* Notice how we route them using the resource_id! */}
              <Link 
                href={`/quiz?id=${quiz.resource_id || quiz.id}`} 
                className={cn(
                  "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors",
                  quiz.is_completed 
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200" 
                    : "bg-slate-900 text-white hover:bg-violet-600"
                )}
              >
                {quiz.is_completed ? 'Retake Assessment' : 'Start Assessment'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}