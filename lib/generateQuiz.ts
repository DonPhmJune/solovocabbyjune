import type { Item, Question, QuestionType, Direction } from './types';

export type GenerateOpts = {
  count: number;
  types: { mcq: boolean; fill: boolean };
  directions: { termToDef: boolean; defToTerm: boolean };
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Sinh hint cho câu fill: "beautiful" → "b _ _ _ _ _ _ _ _ (9)" */
export function makeHint(answer: string): string {
  const words = answer.split(/\s+/).filter(Boolean);
  const shown = words
    .map((w) => (w.length <= 1 ? w : w[0] + ' ' + '_ '.repeat(w.length - 1).trim()))
    .join('  ');
  const lens = words.map((w) => w.length).join(',');
  return `${shown} (${lens})`;
}

export function generateQuiz(items: Item[], opts: GenerateOpts): Question[] {
  if (items.length < 4) {
    throw new Error('Cần ít nhất 4 từ để tạo câu hỏi trắc nghiệm');
  }
  if (opts.count < 1) throw new Error('Số câu phải ≥ 1');

  const modes: Array<{ type: QuestionType; direction: Direction }> = [];
  
  // 1. Trắc nghiệm (MCQ) tuân theo cấu hình của người dùng
  if (opts.types.mcq && opts.directions.termToDef) modes.push({ type: 'mcq', direction: 'term→def' });
  if (opts.types.mcq && opts.directions.defToTerm) modes.push({ type: 'mcq', direction: 'def→term' });
  
  // 2. Điền từ (Fill) LUÔN LUÔN ép buộc là def→term (Nghĩa -> Từ)
  if (opts.types.fill) {
    modes.push({ type: 'fill', direction: 'def→term' });
  }

  if (!modes.length) throw new Error('Phải chọn ít nhất 1 loại câu hỏi');

  // Shuffle items rồi cycle để đủ count
  const pool: Item[] = [];
  let guard = 0;
  while (pool.length < opts.count && guard < 1000) {
    pool.push(...shuffle(items));
    guard++;
  }
  const picked = pool.slice(0, opts.count);

  return picked.map((item, i) => {
    const mode = modes[i % modes.length];
    const id = `q${i + 1}`;
    
    // Vì mode.direction đã được chuẩn hóa ở trên, ta chỉ cần lấy thẳng ra
    const prompt = mode.direction === 'term→def' ? item.term : item.def;
    const correct = mode.direction === 'term→def' ? item.def : item.term;

    if (mode.type === 'mcq') {
      const otherValues = items
        .filter((x) => {
          const v = mode.direction === 'term→def' ? x.def : x.term;
          return v !== correct && x.term !== item.term;
        })
        .map((x) => (mode.direction === 'term→def' ? x.def : x.term));
        
      const uniqueOthers = Array.from(new Set(otherValues));
      const distractors = shuffle(uniqueOthers).slice(0, 3);

      while (distractors.length < 3 && uniqueOthers.length > 0) {
        distractors.push(uniqueOthers[distractors.length % uniqueOthers.length]);
      }

      return {
        id,
        type: 'mcq',
        direction: mode.direction,
        prompt,
        options: shuffle([correct, ...distractors]),
        answer: correct,
      };
    }

    // mode.type === 'fill' (Luôn là def→term)
    return {
      id,
      type: 'fill',
      direction: mode.direction,
      prompt,
      answer: correct,
      hint: makeHint(correct),
    };
  });
}