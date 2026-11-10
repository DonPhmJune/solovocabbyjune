'use client';
import { useEffect, useState } from 'react';
import { Check, X, Lightbulb, ArrowRight } from 'lucide-react';
import type { ClientState } from '@/hooks/useRoom';
import { Button } from '@/components/ui/button';
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
  
  useEffect(() => { setFillValue(''); }, [q.id]);

  const answered = !!state.lastAnswer;
  const isLast = state.currentIdx === state.questions.length - 1;

  const submit = (val: string) => {
    if (answered || !val.trim()) return;
    onAnswer(q.id, val, isLast);
  };

  if (!q) return <div>Đang tải câu hỏi...</div>;

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
            const isMine = answered && state.lastAnswer?.actualAnswer !== opt && opt === state.lastAnswer?.actualAnswer; // Logic hiển thị
            const isCorrect = answered && opt === state.lastAnswer?.actualAnswer;
            // Lưu ý: Trong Async, Client không biết họ đã chọn gì (vì server k trả về câu họ chọn). 
            // Mình sẽ sửa server trả về thêm 'yourAnswer'.
            // Để tạm logic đơn giản:
            return (
              <button
                key={opt}
                disabled={answered}
                onClick={() => submit(opt)}
                className={cn(
                  'group relative rounded-xl border-2 px-5 py-4 text-left font-medium transition-all duration-200 disabled:cursor-not-allowed',
                  !answered && 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md',
                  isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
                  answered && !isCorrect && 'border-slate-200 dark:border-slate-700 opacity-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold',
                    isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  )}>
                    {isCorrect ? <Check className="h-4 w-4" /> : String.fromCharCode(65 + i)}
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

      {/* Kết quả Feedback & Nút Next */}
      {answered && (
        <div className="animate-fade-up rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-center shadow-sm">
          <div className={cn('text-lg font-bold mb-3', state.lastAnswer?.correct ? 'text-emerald-600' : 'text-rose-600')}>
            {state.lastAnswer?.correct ? 'Chính xác! +100 điểm' : `Sai rồi. Đáp án đúng là: ${state.lastAnswer?.actualAnswer}`}
          </div>
          <Button onClick={onNext} className="w-full sm:w-auto">
            {isLast ? 'Xem kết quả' : 'Câu tiếp theo'} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}