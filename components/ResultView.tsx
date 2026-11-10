'use client';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw } from 'lucide-react';
import type { ClientState } from '@/hooks/useRoom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export function ResultView({
  state,
  onPlayAgain,
}: {
  state: ClientState;
  onPlayAgain: () => void;
}) {
  const board = state.finalBoard || [];
  const myRank = board.findIndex((p) => p.id === state.me?.id) + 1;
  const myScore = board.find((p) => p.id === state.me?.id)?.score ?? 0;

  useEffect(() => {
    if (myRank >= 1 && myRank <= 3) {
      confetti({
        particleCount: myRank === 1 ? 200 : 100,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'],
      });
    }
  }, [myRank]);

  return (
    <div className="space-y-4">
      <div className="animate-fade-up rounded-2xl border border-slate-200/70 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-8 text-center shadow-lg">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
          <Trophy className="h-8 w-8" />
        </div>
        <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Kết quả của bạn
        </div>
        <div className="mt-1 text-5xl font-bold text-slate-900">
          {myRank > 0 ? `#${myRank}` : '—'}
        </div>
        <div className="mt-1 text-slate-600">
          {state.me?.name} · <span className="font-semibold text-indigo-700">{myScore} điểm</span>
        </div>
      </div>

      <div className="animate-fade-up rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          <Trophy className="h-4 w-4" />
          Bảng xếp hạng
        </h3>
        <ol className="space-y-2">
          {board.map((p, i) => {
            const isMe = p.id === state.me?.id;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            return (
              <li
                key={p.id}
                className={cn(
                  'flex items-center justify-between rounded-xl px-4 py-3 transition-all',
                  isMe
                    ? 'bg-gradient-to-r from-indigo-100 to-violet-100 font-semibold text-indigo-900 shadow-sm'
                    : i < 3
                    ? 'bg-amber-50'
                    : 'bg-slate-50'
                )}
                style={{ animation: `fade-up 0.4s ${i * 60}ms both` }}
              >
                <span className="flex items-center gap-3">
                  <span className="w-7 text-center text-lg">{medal}</span>
                  <span className="text-sm">{p.name}</span>
                  {isMe && (
                    <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                      Bạn
                    </span>
                  )}
                </span>
                <span className="tabular-nums text-sm font-semibold">{p.score}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {state.isHost && (
        <Button
          onClick={onPlayAgain}
          variant="secondary"
          size="lg"
          className="w-full animate-fade-up"
        >
          <RotateCcw className="h-4 w-4" />
          Chơi lại
        </Button>
      )}
    </div>
  );
}