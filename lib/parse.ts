import type { Item } from './types';

/**
 * Parse text thành word/def pairs, CHỈ split bằng TAB (\t).
 * Mỗi dòng: <word>\t<definition>
 * - Bỏ dòng trống
 * - Bỏ dòng không có tab
 * - Bỏ dòng có cột rỗng
 * - Nếu có >2 cột (tab thừa), lấy cột 1 và 2
 */
export function parseInput(text: string): Item[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.split('\t').map((s) => s.trim()))
    .filter((parts) => parts.length >= 2 && parts[0] && parts[1])
    .map((parts) => ({ term: parts[0], def: parts[1] }));
}