export type Item = { term: string; def: string };

export type QuestionType = 'mcq' | 'fill';
export type Direction = 'term→def' | 'def→term';

export type Question = {
  id: string;
  type: QuestionType;
  direction: Direction;
  prompt: string;
  options?: string[];
  answer: string;
  hint?: string;
};

// Câu hỏi khi gửi xuống client — bỏ answer
export type PublicQuestion = Omit<Question, 'answer'>;

export type RoomConfig = {
  timePerQ: number; // seconds
};

export type LobbyPlayer = { id: string; name: string };

export type LeaderboardEntry = { id: string; name: string; score: number };
export type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  time: number;
};