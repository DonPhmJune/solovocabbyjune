'use client';
import { useEffect, useRef, useState } from 'react';
import PartySocket from 'partysocket';
import type { PublicQuestion, LeaderboardEntry, ChatMessage } from '@/lib/types';

export type ClientState = {
  phase: 'connecting' | 'lobby' | 'playing' | 'finished';
  me: { id: string; name: string } | null;
  isHost: boolean;
  lobbyPlayers: { id: string; name: string }[];
  questions: PublicQuestion[];
  currentIdx: number;
  startTime: number;
  lastAnswer: { correct: boolean; actualAnswer: string; score: number; yourAnswer: string } | null;
  leaderboard: LeaderboardEntry[];
  finalBoard: LeaderboardEntry[] | null;
  messages: ChatMessage[]; // Thêm chat
  error: string | null;
};

const INIT: ClientState = {
  phase: 'connecting', me: null, isHost: false, lobbyPlayers: [], questions: [],
  currentIdx: 0, startTime: 0, lastAnswer: null, leaderboard: [], finalBoard: null, messages: [], error: null,
};

export function useRoom(code: string, name: string) {
  const [state, setState] = useState<ClientState>(INIT);
  const socketRef = useRef<PartySocket | null>(null);

  useEffect(() => {
    if (!code) return;

    const socket = new PartySocket({
      host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || '127.0.0.1:8787',
      party: 'room-server', 
      room: code,
      query: { name },
    });
    
    socketRef.current = socket;

    socket.addEventListener('message', (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        setState(prev => {
          switch (msg.type) {
            case 'welcome': 
              return { ...prev, me: msg, isHost: msg.isHost, phase: 'lobby' };
            case 'you_are_host': 
              return { ...prev, isHost: true };
            case 'lobby': 
              return { ...prev, phase: 'lobby', lobbyPlayers: msg.players };
            case 'game_started': 
              return { ...prev, phase: 'playing', questions: msg.questions, startTime: msg.startTime, currentIdx: 0, messages: [] };
            case 'answer_ack': 
              return { ...prev, lastAnswer: msg };
            case 'leaderboard': 
              return { ...prev, leaderboard: msg.board };
            case 'chat_history':
              return { ...prev, messages: msg.messages };
            case 'chat':
              return { ...prev, messages: [...prev.messages, msg.message] };
            case 'finished': 
              return { ...prev, phase: 'finished', finalBoard: msg.board };
            case 'error': 
              return { ...prev, error: msg.message };
            default: 
              return prev;
          }
        });
      } catch (err) {
        console.error('Lỗi parse tin nhắn:', err);
      }
    });

    socket.addEventListener('close', () => {
      setState(p => ({ ...p, error: 'Mất kết nối tới server' }));
    });

    return () => socket.close();
  }, [code, name]);

  const start = (questions: any[]) => {
    socketRef.current?.send(JSON.stringify({ type: 'start', questions }));
  };

  const answer = (qId: string, value: string, isLast: boolean) => {
    socketRef.current?.send(JSON.stringify({ type: 'answer', qId, value, isLast }));
  };

  const nextQuestion = () => {
    setState(p => ({ ...p, currentIdx: p.currentIdx + 1, lastAnswer: null }));
  };

  const sendChat = (text: string) => {
    socketRef.current?.send(JSON.stringify({ type: 'chat', text }));
  };

  return { state, start, answer, nextQuestion, sendChat };
}