'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Wand2, User, ChevronRight } from 'lucide-react';
import { parseInput } from '@/lib/parse';
import { generateQuiz } from '@/lib/generateQuiz';
import { shortCode } from '@/lib/shortCode';
import type { Item } from '@/lib/types';
import { ItemEditor } from '@/components/ItemEditor';
import { ConfigPanel, type Config } from '@/components/ConfigPanel';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DEFAULT_CONFIG: Config = {
  count: 10,
  timePerQ: 15,
  mcq: true,
  fill: true,
  termToDef: true,
  defToTerm: false,
};

const SAMPLE = `apple\tquả táo
run\tchạy
beautiful\tđẹp
car\txe hơi
book\tsách
house\tnhà
water\tnước
fire\tlửa
mountain\tnúi
ocean\tđại dương`;

export default function CreatePage() {
  const router = useRouter();
  const [raw, setRaw] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [hostName, setHostName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadText = (text: string) => {
    const parsed = parseInput(text);
    if (!parsed.length) {
      setError('Không có dòng nào chứa TAB. Mỗi dòng phải có 1 ký tự TAB giữa từ và nghĩa.');
      return;
    }
    setItems(parsed);
    setError(null);
  };

  const onFile = async (file: File) => {
    const text = await file.text();
    loadText(text);
  };

  const create = () => {
    setError(null);
    if (!hostName.trim()) return setError('Nhập tên của bạn');
    if (items.length < 4) return setError('Cần ít nhất 4 từ');

    let questions;
    try {
      questions = generateQuiz(items, {
        count: config.count,
        types: { mcq: config.mcq, fill: config.fill },
        directions: { termToDef: config.termToDef, defToTerm: config.defToTerm },
      });
    } catch (e: any) {
      return setError(e.message);
    }

    const code = shortCode(6);
    sessionStorage.setItem(
      `quiz:${code}`,
      JSON.stringify({ questions, config: { timePerQ: config.timePerQ } })
    );
    router.push(`/solo/${code}?name=${encodeURIComponent(hostName.trim())}&host=1`);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 text-center animate-fade-up">
        <h1 className="text-3xl font-bold text-slate-900">Tạo phòng Solo Quiz</h1>
        <p className="mt-2 text-slate-600">
          Paste danh sách từ vựng → cấu hình → lấy link mời bạn bè
        </p>
      </div>

      <div className="stagger space-y-4">
        <Card>
          <CardHeader
            step={1}
            title="Nhập từ vựng"
            description={
              <>
                Mỗi dòng 1 cặp, cách nhau bằng <b>TAB</b>. Copy trực tiếp từ Excel
                hoặc Google Sheets.
              </>
            }
          />
          <CardBody className="space-y-3">
            <textarea
              className="h-40 w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-sm whitespace-pre shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              placeholder={'apple\tquả táo\nrun\tchạy\nbeautiful\tđẹp'}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => loadText(raw)} size="md">
                <Wand2 className="h-4 w-4" />
                Parse
              </Button>
              <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50">
                <Upload className="h-4 w-4" />
                Upload .txt/.tsv
                <input
                  type="file"
                  accept=".txt,.tsv,.tab"
                  className="hidden"
                  onChange={(e) => e.target.files && onFile(e.target.files[0])}
                />
              </label>
              <Button variant="ghost" size="md" onClick={() => setRaw(SAMPLE)}>
                <FileText className="h-4 w-4" />
                Dùng mẫu
              </Button>
            </div>
          </CardBody>
        </Card>

        {items.length > 0 && (
          <Card className="animate-fade-up">
            <CardHeader
              step={2}
              title={`Preview (${items.length} từ)`}
              description="Click vào ô để sửa, ✕ để xóa"
            />
            <CardBody>
              <ItemEditor items={items} setItems={setItems} />
            </CardBody>
          </Card>
        )}

        {items.length > 0 && (
          <Card className="animate-fade-up">
            <CardHeader step={3} title="Cấu hình" />
            <CardBody>
              <ConfigPanel config={config} setConfig={setConfig} maxCount={items.length * 4} />
            </CardBody>
          </Card>
        )}

        {items.length > 0 && (
          <Card className="animate-fade-up">
            <CardHeader step={4} title="Tên của bạn & tạo phòng" />
            <CardBody className="space-y-3">
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-10"
                  placeholder="VD: Minh"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                />
              </div>
              <Button onClick={create} size="lg" className="w-full">
                Tạo phòng & lấy link
                <ChevronRight className="h-5 w-5" />
              </Button>
            </CardBody>
          </Card>
        )}

        {error && (
          <div className="animate-shake rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}