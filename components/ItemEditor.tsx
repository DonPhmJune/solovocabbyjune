'use client';
import { X } from 'lucide-react';
import type { Item } from '@/lib/types';

export function ItemEditor({
  items,
  setItems,
}: {
  items: Item[];
  setItems: (i: Item[]) => void;
}) {
  const update = (idx: number, key: keyof Item, value: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: value };
    setItems(next);
  };
  const remove = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  return (
    <div className="max-h-80 overflow-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2.5 w-1/2">Word</th>
            <th className="px-3 py-2.5 w-1/2">Definition</th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/50">
              <td className="px-1 py-0.5">
                <input
                  className="w-full rounded-md bg-transparent px-2 py-1.5 outline-none transition-colors focus:bg-yellow-50"
                  value={it.term}
                  onChange={(e) => update(i, 'term', e.target.value)}
                />
              </td>
              <td className="px-1 py-0.5">
                <input
                  className="w-full rounded-md bg-transparent px-2 py-1.5 outline-none transition-colors focus:bg-yellow-50"
                  value={it.def}
                  onChange={(e) => update(i, 'def', e.target.value)}
                />
              </td>
              <td className="text-center">
                <button
                  onClick={() => remove(i)}
                  className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}