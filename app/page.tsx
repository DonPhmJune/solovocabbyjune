import Link from 'next/link';
import { Sparkles, Zap, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-slate [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
        <div className="animate-in mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/60 px-4 py-1.5 text-sm font-medium text-indigo-700 backdrop-blur">
          <Sparkles className="h-4 w-4" />
          Realtime · Miễn phí · Không cần đăng ký
        </div>

        <h1 className="text-balance text-5xl font-bold tracking-tight text-slate-900 md:text-6xl">
          Trắc nghiệm từ vựng
          <br />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            cùng bạn bè, tức thì
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-balance text-lg text-slate-600">
          Paste danh sách từ vựng (word → definition), tạo phòng, gửi link, và thi đấu
          realtime. Không cần cài đặt, không cần tài khoản.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/create"
            className="group inline-flex h-14 items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40"
          >
            Tạo phòng mới
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="stagger mt-20 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          {[
            { icon: Zap, title: 'Tạo trong 30 giây', desc: 'Paste là xong, không cần cấu hình phức tạp.' },
            { icon: Users, title: 'Nhiều người chơi', desc: 'Gửi link, ai cũng vào được ngay lập tức.' },
            { icon: Sparkles, title: 'Tự động sinh câu', desc: 'Trắc nghiệm + điền từ từ chính bộ từ của bạn.' },
          ].map((f, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/70 bg-white/70 p-6 text-left shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}