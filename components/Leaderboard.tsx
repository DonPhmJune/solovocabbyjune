'use client';
import { Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/types';
import { cn } from '@/lib/cn';

export function Leaderboard({
  board,
  myId,
}: {
  board: LeaderboardEntry[];
  myId?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        <Trophy className="h-3.5 w-3.5" />
        Bảng điểm
      </h3>
      <ol className="space-y-1.5">
        {board.map((p, i) => {
          const isMe = p.id === myId;
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
          return (
            <li
              key={p.id}
              className={cn(
                'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm transition-colors',
                isMe
                  ? 'bg-gradient-to-r from-indigo-50 to-violet-50 font-semibold text-indigo-900'
                  : 'text-slate-700'
              )}
            >
              <span className="flex items-center gap-2">
                <span className="w-5 text-center">{medal ?? `${i + 1}.`}</span>
                <span className="truncate">{p.name}</span>
              </span>
              <span className="tabular-nums">{p.score}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}