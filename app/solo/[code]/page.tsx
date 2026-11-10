'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Sparkles, User, Trophy } from 'lucide-react';
import { useRoom } from '@/hooks/useRoom';
import { Lobby } from '@/components/Lobby';
import { QuestionView } from '@/components/QuestionView';
import { ResultView } from '@/components/ResultView';
import { Leaderboard } from '@/components/Leaderboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SoloPage() {
  const params = useParams<{ code: string }>();
  const search = useSearchParams();
  const code = params.code;
  const isHostParam = search.get('host') === '1';
  const initialName = search.get('name') || '';

  const [name, setName] = useState(initialName);
  const [joined, setJoined] = useState(!!initialName);
  const [nameInput, setNameInput] = useState('');
  const [hostQuiz, setHostQuiz] = useState<any>(null);

  useEffect(() => {
    if (!isHostParam) return;
    const raw = sessionStorage.getItem(`quiz:${code}`);
    if (raw) setHostQuiz(JSON.parse(raw));
  }, [code, isHostParam]);

  const { state, start, answer, nextQuestion } = useRoom(joined ? code : '', name);

  if (!joined) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <div className="animate-fade-up rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-8 shadow-lg backdrop-blur">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-lg shadow-blue-500/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold">Vào phòng Solo Quiz</h1>
            <p className="mt-1 text-sm text-slate-500">Mã phòng: <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{code}</span></p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (nameInput.trim()) { setName(nameInput.trim()); setJoined(true); } }} className="space-y-3">
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-10" placeholder="Tên của bạn" value={nameInput} onChange={(e) => setNameInput(e.target.value)} autoFocus />
            </div>
            <Button size="lg" className="w-full">Vào phòng</Button>
          </form>
        </div>
      </main>
    );
  }

  if (state.phase === 'connecting') {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Đang kết nối...</div>;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold">Solo Quiz</span>
        </div>
        <span className="rounded-full bg-white dark:bg-slate-800 px-3 py-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 shadow-sm">
          {code}
        </span>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <div>
          {state.phase === 'lobby' && (
            <Lobby state={state} code={code} canStart={!!hostQuiz && state.isHost} onStart={() => { if (hostQuiz) start(hostQuiz.questions); }} />
          )}
          {state.phase === 'playing' && (
            <QuestionView state={state} onAnswer={answer} onNext={nextQuestion} />
          )}
          {state.phase === 'finished' && (
            <ResultView state={state} onPlayAgain={() => window.location.reload()} />
          )}
        </div>

        {/* Hiển thị Leaderboard trực tiếp bên cạnh */}
        {state.phase !== 'lobby' && (
          <aside className="animate-fade-up">
            <div className="sticky top-6">
              <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-4 shadow-sm backdrop-blur">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <Trophy className="h-3.5 w-3.5" /> Bảng điểm
                </h3>
                <ol className="space-y-2">
                  {state.leaderboard.map((p, i) => (
                    <li key={p.id} className={`flex justify-between text-sm ${p.id === state.me?.id ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}>
                      <span>{i + 1}. {p.name}</span>
                      <span>{p.score} đ</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}