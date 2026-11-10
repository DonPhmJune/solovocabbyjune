import type * as Party from 'partykit/server';
import { checkFill } from '../lib/checkFill';
import type { Question, PublicQuestion } from '../lib/types';

type Player = {
  id: string;
  name: string;
  score: number;
  finished: boolean;
  finishTimeMs: number;
};

export default class RoomServer implements Party.Server {
  phase: 'lobby' | 'playing' | 'finished' = 'lobby';
  questions: Question[] = [];
  players = new Map<string, Player>();
  hostId: string | null = null;
  startTime = 0;

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const url = new URL(ctx.request.url);
    const name = (url.searchParams.get('name') || 'Player').slice(0, 24);
    const isHost = this.hostId === null;
    if (isHost) this.hostId = conn.id;

    this.players.set(conn.id, {
      id: conn.id, name, score: 0, finished: false, finishTimeMs: 0
    });

    conn.send(JSON.stringify({ type: 'welcome', id: conn.id, name, isHost }));
    this.broadcastLobby();
  }

  onClose(conn: Party.Connection) {
    if (this.hostId === conn.id && this.phase === 'lobby') {
      this.hostId = null;
      const next = [...this.players.values()][0];
      if (next) {
        this.hostId = next.id;
        this.room.getConnection(next.id)?.send(JSON.stringify({ type: 'you_are_host' }));
      }
    }
    this.broadcastLobby();
  }

  onMessage(raw: string, sender: Party.Connection) {
    let msg: any;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === 'start' && sender.id === this.hostId && this.phase === 'lobby') {
      this.questions = msg.questions;
      this.phase = 'playing';
      this.startTime = Date.now();
      
      // Gửi toàn bộ câu hỏi cho mọi người (ẩn đáp án)
      const publicQs: PublicQuestion[] = this.questions.map(q => ({
        id: q.id, type: q.type, direction: q.direction, prompt: q.prompt, options: q.options, hint: q.hint
      }));
      
      this.room.broadcast(JSON.stringify({ type: 'game_started', questions: publicQs, startTime: this.startTime }));
      this.broadcastLeaderboard();
    }

    if (msg.type === 'answer' && this.phase === 'playing') {
      const p = this.players.get(sender.id);
      if (!p || p.finished) return;

      const q = this.questions.find(x => x.id === msg.qId);
      if (!q) return;

      const correct = q.type === 'mcq' ? msg.value === q.answer : checkFill(msg.value, q.answer);
      
      // Điểm: 100 điểm nếu đúng. (Không cần bonus tốc độ ở đây vì đã tính tổng thời gian)
      const pts = correct ? 100 : 0;
      p.score += pts;

      // Đánh dấu nếu đây là câu cuối
      if (msg.isLast) {
        p.finished = true;
        p.finishTimeMs = Date.now() - this.startTime;
      }

      sender.send(JSON.stringify({ type: 'answer_ack', correct, actualAnswer: q.answer, score: p.score }));
      this.broadcastLeaderboard();

      // Nếu tất cả mọi người đều xong
      const allFinished = [...this.players.values()].every(x => x.finished);
      if (allFinished && this.players.size > 0) {
        this.finishGame();
      }
    }
  }

  finishGame() {
    this.phase = 'finished';
    const board = [...this.players.values()].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score; // Điểm cao thắng
      return a.finishTimeMs - b.finishTimeMs; // Nếu bằng điểm, ai nhanh hơn thắng
    });
    this.room.broadcast(JSON.stringify({ type: 'finished', board }));
  }

  broadcastLobby() {
    const list = [...this.players.values()].map(p => ({ id: p.id, name: p.name }));
    this.room.broadcast(JSON.stringify({ type: 'lobby', players: list }));
  }

  broadcastLeaderboard() {
    const board = [...this.players.values()]
      .map(p => ({ id: p.id, name: p.name, score: p.score }))
      .sort((a, b) => b.score - a.score);
    this.room.broadcast(JSON.stringify({ type: 'leaderboard', board }));
  }
}
RoomServer satisfies Party.Worker;