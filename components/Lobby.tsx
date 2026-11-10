'use client';
import { Copy, Check, Users, Crown, Play } from 'lucide-react';
import { useState } from 'react';
import type { ClientState } from '@/hooks/useRoom';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export function Lobby({
  state,
  onStart,
  canStart,
  code,
}: {
  state: ClientState;
  onStart: () => void;
  canStart: boolean;
  code: string;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/solo/${code}` : '';

  const copy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-4">
      <Card className="animate-fade-up bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
            <Users className="h-4 w-4" />
            Mời bạn bè vào phòng
          </div>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-mono text-slate-700 shadow-sm"
            />
            <Button onClick={copy} variant={copied ? 'secondary' : 'primary'}>
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Đã copy
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="text-sm text-slate-600">
            Mã phòng:{' '}
            <span className="rounded-md bg-white px-2 py-0.5 font-mono font-bold text-indigo-700 shadow-sm">
              {code}
            </span>
          </div>
        </CardBody>
      </Card>

      <Card className="animate-fade-up">
        <CardBody>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Người chơi
            </h3>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              {state.lobbyPlayers.length}
            </span>
          </div>
          <ul className="space-y-1.5">
            {state.lobbyPlayers.map((p, i) => {
              const isMe = p.id === state.me?.id;
              const isHost = isMe && state.isHost;
              return (
                <li
                  key={p.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2 transition-colors',
                    isMe ? 'bg-indigo-50' : 'bg-slate-50/60'
                  )}
                  style={{ animation: `fade-up 0.3s ${i * 40}ms both` }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm font-medium text-slate-900">
                    {p.name}
                    {isMe && <span className="ml-1.5 text-xs text-indigo-600">(bạn)</span>}
                  </span>
                  {isHost && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      <Crown className="h-3 w-3" />
                      Host
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>

      {state.isHost ? (
        <Button
          onClick={onStart}
          disabled={!canStart}
          size="lg"
          className="w-full animate-fade-up"
        >
          <Play className="h-5 w-5 fill-current" />
          {canStart ? 'Bắt đầu' : 'Đang tải câu hỏi...'}
        </Button>
      ) : (
        <div className="animate-fade-up flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/50 px-4 py-6 text-sm text-slate-500">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500" />
          Chờ host bắt đầu...
        </div>
      )}
    </div>
  );
}