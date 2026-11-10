import { Server, routePartykitRequest } from 'partyserver';
import { checkFill } from '../lib/checkFill';
import type { Question, PublicQuestion, ChatMessage } from '../lib/types';

export class RoomServer extends Server {
  phase: 'lobby' | 'playing' | 'finished' = 'lobby';
  questions: Question[] = [];
  players = new Map<string, any>();
  hostId: string | null = null;
  startTime = 0;
  chatHistory: ChatMessage[] = []; // Lưu lịch sử chat

  onConnect(connection: any, ctx: any) {
    const url = new URL(ctx.request.url);
    const name = (url.searchParams.get('name') || 'Player').slice(0, 24);
    const isHost = this.hostId === null;
    if (isHost) this.hostId = connection.id;

    this.players.set(connection.id, {
      id: connection.id, name, score: 0, finished: false, finishTimeMs: 0
    });

    // Gửi thông tin chào mừng + lịch sử chat cho người mới vào
    connection.send(JSON.stringify({ type: 'welcome', id: connection.id, name, isHost }));
    connection.send(JSON.stringify({ type: 'chat_history', messages: this.chatHistory }));
    
    this.broadcastLobby();
  }

  onClose(connection: any) {
    if (this.hostId === connection.id && this.phase === 'lobby') {
      this.hostId = null;
      const next = [...this.players.values()][0];
      if (next) {
        this.hostId = next.id;
        this.getConnection(next.id)?.send(JSON.stringify({ type: 'you_are_host' }));
      }
    }
    this.broadcastLobby();
  }

  onMessage(connection: any, message: string) {
    let msg: any;
    try { msg = JSON.parse(message); } catch { return; }

    // 1. XỬ LÝ CHAT
    if (msg.type === 'chat') {
      const p = this.players.get(connection.id);
      if (!p || !msg.text.trim()) return;

      const chatMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: p.name,
        text: msg.text.trim().slice(0, 200), // Giới hạn 200 ký tự
        time: Date.now()
      };
      
      this.chatHistory.push(chatMsg);
      if (this.chatHistory.length > 100) this.chatHistory.shift(); // Chỉ giữ 100 tin nhắn gần nhất
      
      this.broadcast(JSON.stringify({ type: 'chat', message: chatMsg }));
      return;
    }

    // 2. BẮT ĐẦU GAME
    if (msg.type === 'start' && connection.id === this.hostId && this.phase === 'lobby') {
      this.questions = msg.questions;
      this.phase = 'playing';
      this.startTime = Date.now();
      this.chatHistory = []; // Xóa chat cũ khi bắt đầu ván mới
      
      const publicQs: PublicQuestion[] = this.questions.map(q => ({
        id: q.id, type: q.type, direction: q.direction, prompt: q.prompt, options: q.options, hint: q.hint
      }));
      
      this.broadcast(JSON.stringify({ type: 'game_started', questions: publicQs, startTime: this.startTime }));
      this.broadcastLeaderboard();
    }

    // 3. TRẢ LỜI CÂU HỎI
    if (msg.type === 'answer' && this.phase === 'playing') {
      const p = this.players.get(connection.id);
      if (!p || p.finished) return;

      const q = this.questions.find(x => x.id === msg.qId);
      if (!q) return;

      const correct = q.type === 'mcq' ? msg.value === q.answer : checkFill(msg.value, q.answer);
      const pts = correct ? 100 : 0;
      p.score += pts;

      connection.send(JSON.stringify({ type: 'answer_ack', correct, actualAnswer: q.answer, score: p.score, yourAnswer: msg.value }));
      this.broadcastLeaderboard();

      // NẾU LÀ CÂU CUỐI -> KẾT THÚC NGAY LẬP TỨC (ĐUA TỐC ĐỘ)
      if (msg.isLast) {
        p.finished = true;
        p.finishTimeMs = Date.now() - this.startTime;
        this.finishGame(); // Dừng game của tất cả mọi người
      }
    }
  }

  finishGame() {
    if (this.phase === 'finished') return; // Tránh gọi 2 lần
    this.phase = 'finished';
    
    // Sắp xếp: Điểm cao trước, nếu bằng điểm thì ai xong trước (thời gian ít hơn) thắng
    const board = [...this.players.values()].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const timeA = a.finishTimeMs || 999999999;
      const timeB = b.finishTimeMs || 999999999;
      return timeA - timeB;
    });
    
    this.broadcast(JSON.stringify({ type: 'finished', board }));
  }

  broadcastLobby() {
    const list = [...this.players.values()].map(p => ({ id: p.id, name: p.name }));
    this.broadcast(JSON.stringify({ type: 'lobby', players: list }));
  }

  broadcastLeaderboard() {
    const board = [...this.players.values()]
      .map(p => ({ id: p.id, name: p.name, score: p.score }))
      .sort((a, b) => b.score - a.score);
    this.broadcast(JSON.stringify({ type: 'leaderboard', board }));
  }
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    return (
      (await routePartykitRequest(request, env)) ||
      new Response("Not Found", { status: 404 })
    );
  },
} satisfies ExportedHandler;