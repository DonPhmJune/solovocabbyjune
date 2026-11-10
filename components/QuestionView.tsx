'use client';
import { useEffect, useState } from 'react';
import { Check, X, Lightbulb } from 'lucide-react';
import type { ClientState } from '@/hooks/useRoom';
import { cn } from '@/lib/cn';

export function QuestionView({
  state, onAnswer, onNext
}: {
  state: ClientState;
  onAnswer: (qId: string, val: string, isLast: boolean) => void;
  onNext: () => void;
}) {
  const q = state.questions[state.currentIdx];
  const [fillValue, setFillValue] = useState('');
  
  useEffect(() => { 
    setFillValue(''); 
  }, [q?.id]);

  const answered = !!state.lastAnswer;
  const isLast = state.currentIdx === state.questions.length - 1;

  // TỰ ĐỘNG CHUYỂN CÂU SAU 1.5 GIÂY
  useEffect(() => {
    if (answered && !isLast) {
      const timer = setTimeout(() => {
        onNext();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [answered, isLast, onNext]);

  const submit = (val: string) => {
    if (answered || !val.trim()) return;
    onAnswer(q.id, val, isLast);
  };

  if (!q) return <div className="text-center p-10 text-slate-500">Đang tải câu hỏi...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between animate-fade-up">
        <span className="rounded-full bg-white dark:bg-slate-800 px-3 py-1 text-sm font-semibold shadow-sm">
          Câu {state.currentIdx + 1} / {state.questions.length}
        </span>
      </div>

      <div className="animate-fade-up rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-8 text-center shadow-lg backdrop-blur">
        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          {q.direction === 'term→def' ? 'Nghĩa của từ này là gì?' : 'Từ nào có nghĩa này?'}
        </div>
        <div className="text-3xl font-bold leading-tight text-slate-900 dark:text-slate-100 md:text-4xl">
          {q.prompt}
        </div>
        {q.type === 'fill' && q.hint && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-4 py-2 text-sm font-mono text-amber-900 dark:text-amber-200">
            <Lightbulb className="h-4 w-4" />
            {q.hint}
          </div>
        )}
      </div>

      {q.type === 'mcq' ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {q.options?.map((opt, i) => {
            const isCorrectAnswer = answered && opt === state.lastAnswer?.actualAnswer;
            const isWrongPick = answered && opt === state.lastAnswer?.yourAnswer && opt !== state.lastAnswer?.actualAnswer;
            const isOther = answered && !isCorrectAnswer && !isWrongPick;

            return (
              <button
                key={opt}
                disabled={answered}
                onClick={() => submit(opt)}
                className={cn(
                  'group relative rounded-xl border-2 px-5 py-4 text-left font-medium transition-all duration-200 disabled:cursor-not-allowed',
                  !answered && 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md',
                  isCorrectAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
                  isWrongPick && 'border-rose-500 bg-rose-50 dark:bg-rose-950/30',
                  isOther && 'border-slate-200 dark:border-slate-700 opacity-40'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-colors',
                    isCorrectAnswer ? 'bg-emerald-500 text-white' : 
                    isWrongPick ? 'bg-rose-500 text-white' : 
                    'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  )}>
                    {isCorrectAnswer ? <Check className="h-4 w-4" /> : 
                     isWrongPick ? <X className="h-4 w-4" /> : 
                     String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-slate-900 dark:text-slate-100">{opt}</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); submit(fillValue); }} className="animate-fade-up">
          <input
            autoFocus disabled={answered}
            className={cn(
              'h-14 w-full rounded-xl border-2 bg-white dark:bg-slate-900 px-5 text-lg font-medium shadow-sm outline-none transition-all',
              answered && state.lastAnswer?.correct && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
              answered && !state.lastAnswer?.correct && 'border-rose-500 bg-rose-50 dark:bg-rose-950/30',
              !answered && 'border-slate-200 dark:border-slate-700 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50'
            )}
            placeholder="Gõ từ tiếng Anh..."
            value={fillValue} onChange={(e) => setFillValue(e.target.value)}
          />
        </form>
      )}

      {/* Kết quả Feedback & Tự động chuyển câu */}
      {answered && (
        <div className="animate-fade-up rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-center shadow-sm">
          <div className={cn('text-lg font-bold mb-2', state.lastAnswer?.correct ? 'text-emerald-600' : 'text-rose-600')}>
            {state.lastAnswer?.correct 
              ? 'Chính xác! +100 điểm' 
              : `Sai rồi. Đáp án đúng là: ${state.lastAnswer?.actualAnswer}`}
          </div>
          
          {!isLast ? (
            <div className="text-sm text-slate-500 dark:text-slate-400 animate-pulse flex items-center justify-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>
              Đang chuyển câu tiếp theo...
            </div>
          ) : (
            <div className="text-sm text-blue-500 dark:text-blue-400 font-semibold animate-pulse">
              Đang chờ tổng kết...
            </div>
          )}
        </div>
      )}
    </div>
  );
}