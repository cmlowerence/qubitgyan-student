'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Resource } from '@/types';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle, XCircle, ChevronRight, ChevronLeft, Play, Trophy } from 'lucide-react';
import { useUi } from '@/components/providers/ui-provider';

interface QuizViewerProps {
  resource: Resource;
  onComplete?: () => void;
}

interface Option { id: number; text: string; }
interface Question { id: number; text: string; image_url?: string; marks_positive: string; marks_negative: string; order: number; options: Option[]; }
interface Quiz { id: number; passing_score_percentage: number; time_limit_minutes: number; questions: Question[]; }
interface AttemptResponse { id: number; question: number; question_text: string; selected_option: number | null; selected_option_text: string; is_correct: boolean; }
interface AttemptResult { id: number; total_score: number; is_completed: boolean; responses: AttemptResponse[]; }

export function QuizViewer({ resource, onComplete }: QuizViewerProps) {
  const { showConfirm, showAlert } = useUi();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizState, setQuizState] = useState<'START' | 'ACTIVE' | 'SUBMITTING' | 'RESULTS'>('START');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  const [result, setResult] = useState<AttemptResult | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/public/quizzes/?resource=${resource.id}`);
        if (data && data.length > 0) {
          setQuiz(data[0]);
          setTimeLeft(data[0].time_limit_minutes * 60);
        }
      } catch (error) {
        console.error("Failed to load quiz", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, [resource.id]);

  useEffect(() => {
    if (quizState !== 'ACTIVE' || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState, timeLeft]);

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!quiz) return;

    if (!isAutoSubmit) {
      const confirmed = await showConfirm({
        title: 'Submit Quiz?',
        message: 'Are you sure you want to submit your answers? You cannot change them after submission.',
        confirmText: 'Yes, submit',
        variant: 'info', // FIX: Changed from 'primary' to 'info'
      });
      if (!confirmed) return;
    } else {
      await showAlert({ title: "Time's Up!", message: "Your quiz has been automatically submitted.", variant: "warning" });
    }

    setQuizState('SUBMITTING');

    const formattedAnswers = Object.entries(answers).map(([qId, oId]) => ({
      question_id: Number(qId),
      option_id: oId,
    }));

    try {
      const { data } = await api.post('/public/quiz-attempts/submit/', {
        quiz_id: quiz.id,
        answers: formattedAnswers,
      });
      setResult(data);
      setQuizState('RESULTS');
      onComplete?.(); 
    } catch (error) {
      // FIX: Changed from 'destructive' to 'error'
      await showAlert({ title: 'Error', message: 'Failed to submit quiz. Please try again.', variant: 'error' });
      setQuizState('ACTIVE');
    }
  };

  if (isLoading) return <div className="p-10 text-center text-slate-500 animate-pulse">Loading assessment...</div>;
  if (!quiz) return <div className="p-10 text-center text-rose-500 bg-rose-50 rounded-2xl border border-rose-100">No assessment data found for this resource.</div>;

  const currentQuestion = quiz.questions[currentIndex];
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  if (quizState === 'START') {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 text-center shadow-sm max-w-2xl mx-auto mt-6">
        <div className="w-20 h-20 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Ready to test your knowledge?</h2>
        <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-slate-500 mb-1">Questions</p>
            <p className="font-bold text-slate-900 text-lg">{quiz.questions.length}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-slate-500 mb-1">Time Limit</p>
            <p className="font-bold text-slate-900 text-lg">{quiz.time_limit_minutes} mins</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-slate-500 mb-1">Passing Score</p>
            <p className="font-bold text-slate-900 text-lg">{quiz.passing_score_percentage}%</p>
          </div>
        </div>
        <button 
          onClick={() => setQuizState('ACTIVE')}
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-violet-600 transition-all hover:-translate-y-1 shadow-xl shadow-slate-900/20"
        >
          <Play className="w-5 h-5" /> Start Assessment
        </button>
      </div>
    );
  }

  if (quizState === 'RESULTS' && result) {
    const maxScore = quiz.questions.reduce((sum, q) => sum + parseFloat(q.marks_positive), 0);
    const percentage = Math.round((result.total_score / maxScore) * 100);
    const passed = percentage >= quiz.passing_score_percentage;

    return (
      <div className="space-y-6 mt-6">
        <div className={cn("rounded-3xl border p-8 text-center text-white relative overflow-hidden", passed ? "bg-emerald-600 border-emerald-700" : "bg-rose-600 border-rose-700")}>
          <div className="relative z-10">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-black mb-2">{passed ? 'Assessment Passed!' : 'Assessment Failed'}</h2>
            <p className="text-emerald-100/80 text-lg">You scored {result.total_score} out of {maxScore}</p>
            <div className="text-6xl font-black mt-4">{percentage}%</div>
            <p className="mt-4 text-sm opacity-80">Required to pass: {quiz.passing_score_percentage}%</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-xl text-slate-900 px-2">Detailed Review</h3>
          {result.responses.map((resp, i) => (
            <div key={resp.id} className={cn("p-5 rounded-2xl border flex gap-4", resp.is_correct ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100")}>
              <div className="shrink-0 mt-1">
                {resp.is_correct ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : <XCircle className="w-6 h-6 text-rose-600" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Question {i + 1}</p>
                <p className="text-slate-900 font-medium mb-3">{resp.question_text}</p>
                <p className="text-sm">
                  <span className="text-slate-500">Your answer: </span>
                  <span className={cn("font-semibold", resp.is_correct ? "text-emerald-700" : "text-rose-700")}>
                    {resp.selected_option_text || 'Skipped'}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr,300px] gap-6 mt-6">
      <div className="flex flex-col min-h-[500px]">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex-1 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-bold tracking-wide">
              Question {currentIndex + 1} of {quiz.questions.length}
            </span>
            <div className="flex gap-3 text-xs font-semibold text-slate-500">
              <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded">+{currentQuestion.marks_positive}</span>
              <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded">-{currentQuestion.marks_negative}</span>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-slate-900 mb-6 leading-relaxed">
            {currentQuestion.text}
          </h3>

          {currentQuestion.image_url && (
            <img src={currentQuestion.image_url} alt="Question context" className="rounded-xl border border-slate-200 mb-6 max-h-64 object-contain" />
          )}

          <div className="space-y-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = answers[currentQuestion.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: opt.id }))}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3",
                    isSelected 
                      ? "border-violet-600 bg-violet-50 text-violet-900 shadow-md shadow-violet-100" 
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", isSelected ? "border-violet-600" : "border-slate-300")}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-violet-600 rounded-full" />}
                  </div>
                  <span className="font-medium">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button 
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-5 py-3 rounded-xl font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          
          {currentIndex === quiz.questions.length - 1 ? (
            <button 
              onClick={() => handleSubmit(false)}
              disabled={quizState === 'SUBMITTING'}
              className="px-8 py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-violet-600 transition-colors shadow-lg"
            >
              {quizState === 'SUBMITTING' ? 'Submitting...' : 'Submit Assessment'}
            </button>
          ) : (
            <button 
              onClick={() => setCurrentIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
              className="px-5 py-3 rounded-xl font-semibold text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2 shadow-sm"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center shadow-sm">
          <p className="text-slate-500 text-sm font-semibold mb-2">Time Remaining</p>
          <div className={cn("text-4xl font-black font-mono tracking-tight flex items-center gap-3", timeLeft < 60 ? "text-rose-600 animate-pulse" : "text-slate-900")}>
            <Clock className="w-8 h-8 opacity-80" /> {timeString}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-slate-500 text-sm font-semibold mb-4">Question Navigator</p>
          <div className="grid grid-cols-5 gap-2">
            {quiz.questions.map((q, i) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all border",
                    isCurrent ? "ring-2 ring-violet-600 ring-offset-2" : "",
                    isAnswered ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 flex flex-col gap-2 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-violet-600"></div> Answered</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded border border-slate-300 bg-white"></div> Unanswered</div>
          </div>
        </div>
      </div>
    </div>
  );
}