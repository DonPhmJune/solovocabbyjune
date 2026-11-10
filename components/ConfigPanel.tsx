'use client';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export type Config = {
  count: number;
  timePerQ: number;
  mcq: boolean;
  fill: boolean;
  termToDef: boolean;
  defToTerm: boolean;
};

function CheckboxCard({
  checked,
  onChange,
  label,
  sub,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all',
        checked
          ? 'border-indigo-500 bg-indigo-50/60 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300'
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all',
          checked
            ? 'border-indigo-600 bg-indigo-600 text-white'
            : 'border-slate-300 bg-white'
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <div>
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
      </div>
    </button>
  );
}

export function ConfigPanel({
  config,
  setConfig,
  maxCount,
}: {
  config: Config;
  setConfig: (c: Config) => void;
  maxCount: number;
}) {
  const set = (patch: Partial<Config>) => setConfig({ ...config, ...patch });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Số câu
          </span>
          <input
            type="number"
            min={1}
            max={maxCount}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium shadow-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            value={config.count}
            onChange={(e) =>
              set({ count: Math.max(1, Math.min(maxCount, +e.target.value || 1)) })
            }
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Thời gian / câu
          </span>
          <select
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium shadow-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            value={config.timePerQ}
            onChange={(e) => set({ timePerQ: +e.target.value })}
          >
            {[10, 15, 20, 30, 45].map((s) => (
              <option key={s} value={s}>
                {s}s
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-slate-700">Loại câu hỏi</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <CheckboxCard
            checked={config.mcq}
            onChange={(v) => set({ mcq: v })}
            label="Trắc nghiệm"
            sub="Chọn 1 trong 4 đáp án"
          />
          <CheckboxCard
            checked={config.fill}
            onChange={(v) => set({ fill: v })}
            label="Điền từ"
            sub="Gõ đáp án với gợi ý"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-slate-700">Chiều câu hỏi</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <CheckboxCard
            checked={config.termToDef}
            onChange={(v) => set({ termToDef: v })}
            label="Từ → Nghĩa"
            sub="Cho từ tiếng Anh, hỏi nghĩa"
          />
          <CheckboxCard
            checked={config.defToTerm}
            onChange={(v) => set({ defToTerm: v })}
            label="Nghĩa → Từ"
            sub="Cho nghĩa, hỏi từ tiếng Anh"
          />
        </div>
      </div>
    </div>
  );
}