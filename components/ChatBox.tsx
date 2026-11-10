'use client';
import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/cn';

export function ChatBox({
  messages, onSend, myName
}: {
  messages: ChatMessage[]; 
  onSend: (text: string) => void;
  myName?: string;
}) {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <div className="flex flex-col h-[300px] rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur">
      <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-2">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Trò chuyện</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-xs text-slate-400 mt-4">Chưa có tin nhắn nào.</div>
        )}
        {messages.map((m) => {
          const isMe = m.sender === myName;
          return (
            <div key={m.id} className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}>
              {!isMe && <span className="text-[10px] text-slate-500 mb-0.5 ml-1">{m.sender}</span>}
              <div className={cn(
                'px-3 py-1.5 rounded-xl text-sm max-w-[85%] break-words',
                isMe 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-sm'
              )}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="border-t border-slate-100 dark:border-slate-800 p-2 flex gap-2">
        <input
          className="flex-1 rounded-lg border-0 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={!text.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white disabled:opacity-50 transition-colors hover:bg-blue-700"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}