import Link from "next/link";

// 新增小工具時，在這裡加一筆即可
const TOOLS = [
  {
    href: "/lottery",
    icon: "🎡",
    name: "班級抽籤小轉盤",
    description: "輸入座號或姓名，轉盤隨機抽出幸運兒；抽過的人自動移除，適合點名回答、分組與發放任務。",
    accent: "bg-amber-100 text-amber-700",
  },
  {
    href: "/timetable",
    icon: "🗓️",
    name: "製作我的課表",
    description: "拖曳課程掛牌到週一至週五的時段，排出一週八節課的課表，完成後一鍵下載成圖檔。",
    accent: "bg-rose-100 text-rose-700",
  },
];

export default function Home() {
  return (
    <main className="flex-1 bg-slate-50 px-6 py-16 text-slate-800 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <header className="max-w-2xl">
          <p className="text-sm font-semibold tracking-widest text-sky-600">CLASSROOM TOOLKIT</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">我的班級小工具</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            給導師在班級經營與教學時隨手可用的小工具。打開就能用，不需登入，工具會不定期新增。
          </p>
        </header>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500"
              >
                <span className={`flex h-16 w-16 items-center justify-center rounded-2xl text-4xl ${tool.accent}`}>
                  {tool.icon}
                </span>
                <h2 className="mt-6 text-2xl font-bold">{tool.name}</h2>
                <p className="mt-3 flex-1 leading-7 text-slate-600">{tool.description}</p>
                <span className="mt-6 font-semibold text-sky-600">
                  開始使用 <span className="inline-block transition group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </li>
          ))}

          <li className="flex min-h-56 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 p-8 text-center text-slate-500">
            <span className="text-3xl">🛠️</span>
            <p className="mt-3 font-semibold">更多小工具開發中</p>
            <p className="mt-1 text-sm">敬請期待</p>
          </li>
        </ul>

        <footer className="mt-16 text-sm text-slate-400">我的班級小工具 · 給老師的教室好幫手</footer>
      </div>
    </main>
  );
}
