function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(a|an|the|to)\s+/i, '')
    .replace(/[.,!?;:'"`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function checkFill(input: string, answer: string): boolean {
  return normalize(input) === normalize(answer);
}