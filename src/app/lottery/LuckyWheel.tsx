"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { textEm } from "@/lib/text";

type Entry = { id: string; label: string };

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  drift: number;
  size: number;
  color: string;
  round: boolean;
};

const INK = "#3B2A2A";
const PINK = "#EF8DB0";
const SEGMENT_COLORS = ["#F7C948", "#FCF1D4"];
const ODD_LAST_COLOR = "#F9C9D6";
const CONFETTI_COLORS = ["#F7C948", "#EF8DB0", "#7CC6A4", "#8EC5F2", "#FFFFFF", "#F59E6B"];

const DEFAULT_NAMES = [
  "01 王小明",
  "02 李佳穎",
  "03 陳冠宇",
  "04 林怡君",
  "05 張家豪",
  "06 黃詩涵",
  "07 吳承恩",
  "08 劉芷晴",
  "09 蔡宗翰",
  "10 楊欣怡",
];

const SPIN_MS = 5200;
const EXTRA_TURNS = 6;
const BULB_COUNT = 24;
const MAX_PEOPLE = 200;

// 背景裝飾用的彩紙，固定位置避免 hydration 不一致
const DECOR_CONFETTI = [
  { top: "6%", left: "4%", rotate: 25, color: "#F7C948", w: 18, h: 7 },
  { top: "14%", left: "22%", rotate: -30, color: "#FFFFFF", w: 14, h: 6 },
  { top: "4%", left: "70%", rotate: 60, color: "#EF8DB0", w: 16, h: 7 },
  { top: "18%", left: "90%", rotate: -15, color: "#7CC6A4", w: 18, h: 7 },
  { top: "36%", left: "3%", rotate: 80, color: "#EF8DB0", w: 14, h: 6 },
  { top: "44%", left: "95%", rotate: 35, color: "#F7C948", w: 16, h: 6 },
  { top: "60%", left: "8%", rotate: -50, color: "#7CC6A4", w: 16, h: 7 },
  { top: "68%", left: "88%", rotate: 10, color: "#FFFFFF", w: 14, h: 6 },
  { top: "82%", left: "16%", rotate: 45, color: "#F7C948", w: 18, h: 7 },
  { top: "88%", left: "78%", rotate: -70, color: "#EF8DB0", w: 16, h: 6 },
  { top: "28%", left: "50%", rotate: 15, color: "#FFFFFF", w: 12, h: 5 },
  { top: "76%", left: "55%", rotate: -25, color: "#7CC6A4", w: 12, h: 5 },
];

function parseNames(text: string) {
  return text
    .split(/[\n,，、]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function toEntries(labels: string[]): Entry[] {
  return labels.map((label, i) => ({ id: `${i}-${label}`, label }));
}

function segmentColor(i: number, n: number) {
  // 人數為奇數時，最後一格換色，避免與第一格同色相鄰
  if (n > 1 && n % 2 === 1 && i === n - 1) return ODD_LAST_COLOR;
  return SEGMENT_COLORS[i % 2];
}

function polar(r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [r * Math.cos(rad), r * Math.sin(rad)];
}

function makeConfetti(): ConfettiPiece[] {
  return Array.from({ length: 70 }, (_, id) => ({
    id,
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 2.4 + Math.random() * 1.8,
    drift: (Math.random() - 0.5) * 200,
    size: 6 + Math.random() * 8,
    color: CONFETTI_COLORS[id % CONFETTI_COLORS.length],
    round: Math.random() > 0.6,
  }));
}

export default function LuckyWheel() {
  const [allEntries, setAllEntries] = useState<Entry[]>(() => toEntries(DEFAULT_NAMES));
  const [pool, setPool] = useState<Entry[]>(() => toEntries(DEFAULT_NAMES));
  const [drawn, setDrawn] = useState<Entry[]>([]);
  const [listText, setListText] = useState(DEFAULT_NAMES.join("\n"));
  const [countInput, setCountInput] = useState("30");
  const [notice, setNotice] = useState("");

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Entry | null>(null);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const busy = spinning || winner !== null;

  function spin() {
    if (busy || pool.length === 0) return;

    const n = pool.length;
    const seg = 360 / n;
    const index = Math.floor(Math.random() * n);
    const picked = pool[index];

    // 指針在正上方；第 i 格中心位於「由上方順時針 (i + 0.5) * seg 度」
    const jitter = (Math.random() - 0.5) * seg * 0.7;
    const center = (index + 0.5) * seg + jitter;
    const target = (((360 - center) % 360) + 360) % 360;
    const current = ((rotation % 360) + 360) % 360;
    const delta = (((target - current) % 360) + 360) % 360;

    setNotice("");
    setSpinning(true);
    setRotation(rotation + EXTRA_TURNS * 360 + delta);

    timerRef.current = setTimeout(() => {
      setSpinning(false);
      setWinner(picked);
      setDrawn((d) => [...d, picked]);
      setConfetti(makeConfetti());
    }, SPIN_MS);
  }

  function dismissWinner() {
    if (!winner) return;
    const id = winner.id;
    setPool((p) => p.filter((e) => e.id !== id));
    setWinner(null);
    setConfetti([]);
  }

  function applyLabels(labels: string[]) {
    if (labels.length === 0) {
      setNotice("名單是空的，請至少輸入一位。");
      return;
    }
    if (labels.length > MAX_PEOPLE) {
      setNotice(`最多 ${MAX_PEOPLE} 人喔！`);
      return;
    }
    const entries = toEntries(labels);
    setAllEntries(entries);
    setPool(entries);
    setDrawn([]);
    setNotice(`已套用 ${labels.length} 人的名單。`);
  }

  function applyText() {
    applyLabels(parseNames(listText));
  }

  function applyCount() {
    const n = Number.parseInt(countInput, 10);
    if (!Number.isFinite(n) || n < 1 || n > MAX_PEOPLE) {
      setNotice(`請輸入 1 到 ${MAX_PEOPLE} 之間的人數。`);
      return;
    }
    const labels = Array.from({ length: n }, (_, i) => `${String(i + 1).padStart(2, "0")} 號`);
    setListText(labels.join("\n"));
    applyLabels(labels);
  }

  function restart() {
    setPool(allEntries);
    setDrawn([]);
    setNotice("已重新開始，所有人都回到轉盤上了。");
  }

  return (
    <main className="lottery-bg relative flex-1 overflow-hidden px-4 pb-16 pt-8 text-[#3B2A2A] sm:px-6">
      <Decorations />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center">
        <Link
          href="/"
          className="self-start rounded-full border-2 border-[#3B2A2A] bg-white/80 px-4 py-1.5 text-sm font-bold shadow-[3px_3px_0_#3B2A2A] transition hover:-translate-y-0.5"
        >
          ← 回首頁
        </Link>

        <Header />

        <div className="mt-8 grid w-full grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          {/* 左：轉盤 + 抽中名單 */}
          <section className="flex flex-col items-center gap-8">
            <Wheel
              entries={pool}
              rotation={rotation}
              spinning={spinning}
              disabled={busy || pool.length === 0}
              onSpin={spin}
            />

            <p className="-mt-2 rounded-full border-2 border-[#3B2A2A] bg-white/85 px-5 py-1.5 text-base font-bold shadow-[3px_3px_0_#3B2A2A]">
              {pool.length > 0 ? (
                <>
                  轉盤上還有 <span className="text-[#D94F82]">{pool.length}</span> 人，按「開始」抽籤！
                </>
              ) : (
                "全部抽完囉！可以按「重新開始」再玩一輪。"
              )}
            </p>

            <DrawnList drawn={drawn} />
          </section>

          {/* 右：設定 */}
          <aside className="card flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">抽籤設定</h2>
              <span className="rounded-full bg-[#F7C948] px-3 py-1 text-sm font-bold">
                共 {allEntries.length} 人
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="count" className="font-bold">
                一鍵產生座號
              </label>
              <div className="flex gap-2">
                <input
                  id="count"
                  type="number"
                  min={1}
                  max={MAX_PEOPLE}
                  value={countInput}
                  onChange={(e) => setCountInput(e.target.value)}
                  disabled={busy}
                  className="w-full min-w-0 rounded-xl border-2 border-[#3B2A2A] bg-white px-3 py-2 text-lg font-bold outline-none focus:ring-4 focus:ring-[#EF8DB0]/50 disabled:opacity-60"
                />
                <button type="button" onClick={applyCount} disabled={busy} className="btn btn-pink shrink-0">
                  產生
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[10, 20, 30, 40].map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={busy}
                    onClick={() => setCountInput(String(n))}
                    className="rounded-full border-2 border-[#3B2A2A] bg-white px-3 py-0.5 text-sm font-bold transition hover:bg-[#FCF1D4] disabled:opacity-60"
                  >
                    {n} 人
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="names" className="font-bold">
                自訂抽籤名單
              </label>
              <p className="text-sm opacity-75">一行一位，例如「05 張家豪」；也可用逗號分隔。</p>
              <textarea
                id="names"
                rows={9}
                value={listText}
                onChange={(e) => setListText(e.target.value)}
                disabled={busy}
                className="resize-y rounded-xl border-2 border-[#3B2A2A] bg-white px-3 py-2 leading-relaxed outline-none focus:ring-4 focus:ring-[#EF8DB0]/50 disabled:opacity-60"
              />
              <button type="button" onClick={applyText} disabled={busy} className="btn btn-yellow">
                套用名單
              </button>
            </div>

            <button type="button" onClick={restart} disabled={busy} className="btn btn-white">
              ↺ 重新開始（全部放回轉盤）
            </button>

            {notice && (
              <p role="status" className="rounded-xl bg-[#FCF1D4] px-3 py-2 text-sm font-bold">
                {notice}
              </p>
            )}
          </aside>
        </div>
      </div>

      {winner && (
        <WinnerModal winner={winner} order={drawn.length} remaining={pool.length - 1} onClose={dismissWinner} />
      )}
      {confetti.length > 0 && <ConfettiRain pieces={confetti} />}
    </main>
  );
}

function Header() {
  return (
    <header className="mt-2 flex flex-col items-center">
      <h1 className="title-text select-none text-6xl font-black tracking-widest sm:text-7xl">轉轉樂</h1>
      <div className="ribbon mt-3 px-10 py-2 text-lg font-black tracking-wider sm:text-xl">
        班級抽籤小轉盤，幸運兒就是你！
      </div>
    </header>
  );
}

function Wheel({
  entries,
  rotation,
  spinning,
  disabled,
  onSpin,
}: {
  entries: Entry[];
  rotation: number;
  spinning: boolean;
  disabled: boolean;
  onSpin: () => void;
}) {
  const n = entries.length;
  const seg = n > 0 ? 360 / n : 360;
  const R = 196;
  // 文字沿半徑排列：可用長度約為中心按鈕外緣到外圈 (≈ 118)，字高受格子寬度限制
  const TEXT_SPACE = 118;
  const longestEm = Math.max(1, ...entries.map((e) => textEm(e.label)));
  const fontSize = Math.max(
    10,
    Math.min(24, ((2 * Math.PI * 120) / Math.max(n, 1)) * 0.55, TEXT_SPACE / longestEm),
  );
  const fit = (label: string) => {
    if (textEm(label) * fontSize <= TEXT_SPACE) return label;
    let out = label;
    while (out.length > 1 && (textEm(out) + 1) * fontSize > TEXT_SPACE) out = out.slice(0, -1);
    return `${out}…`;
  };

  return (
    <div className={`relative aspect-square w-full max-w-[480px] ${spinning ? "is-spinning" : ""}`}>
      {/* 外圈 + 燈泡 */}
      <svg viewBox="-250 -250 500 500" className="absolute inset-0 h-full w-full drop-shadow-[0_10px_0_rgba(59,42,42,0.25)]">
        <circle r={244} fill={PINK} stroke={INK} strokeWidth={6} />
        <circle r={203} fill={INK} />
        {Array.from({ length: BULB_COUNT }, (_, i) => {
          const [x, y] = polar(224, (360 / BULB_COUNT) * i - 90);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={7}
              fill="#FFFBEA"
              stroke={INK}
              strokeWidth={2}
              className={`wheel-bulb ${i % 2 ? "odd" : ""}`}
            />
          );
        })}
      </svg>

      {/* 旋轉的盤面 */}
      <div
        className="absolute inset-[10%] rounded-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.15, 0.6, 0.1, 1)` : "none",
        }}
      >
        <svg viewBox="-200 -200 400 400" className="h-full w-full">
          {n === 0 && <circle r={R} fill="#FCF1D4" />}
          {n === 1 && <circle r={R} fill={SEGMENT_COLORS[0]} stroke={INK} strokeWidth={3} />}
          {n > 1 &&
            entries.map((e, i) => {
              const a0 = i * seg - 90;
              const a1 = (i + 1) * seg - 90;
              const [x0, y0] = polar(R, a0);
              const [x1, y1] = polar(R, a1);
              const largeArc = seg > 180 ? 1 : 0;
              return (
                <path
                  key={e.id}
                  d={`M0 0 L${x0} ${y0} A${R} ${R} 0 ${largeArc} 1 ${x1} ${y1} Z`}
                  fill={segmentColor(i, n)}
                  stroke={INK}
                  strokeWidth={3}
                  strokeLinejoin="round"
                />
              );
            })}
          {entries.map((e, i) => {
            const mid = (i + 0.5) * seg - 90;
            const text = fit(e.label);
            return (
              <g key={e.id} transform={`rotate(${mid})`}>
                <text
                  x={R - 14}
                  y={0}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize={fontSize}
                  fontWeight={900}
                  fill={INK}
                >
                  {text}
                </text>
              </g>
            );
          })}
          <circle r={R} fill="none" stroke={INK} strokeWidth={5} />
        </svg>
      </div>

      {/* 指針 */}
      <div className="wheel-pointer absolute left-1/2 top-[-1%] z-10 w-[13%] -translate-x-1/2">
        <svg viewBox="0 0 60 84" className="w-full drop-shadow-[0_4px_0_rgba(59,42,42,0.3)]">
          <path
            d="M30 82 C24 66 6 52 6 30 A24 24 0 1 1 54 30 C54 52 36 66 30 82 Z"
            fill={PINK}
            stroke={INK}
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <circle cx={30} cy={30} r={11} fill="#FFFBEA" stroke={INK} strokeWidth={3} />
        </svg>
      </div>

      {/* 中央開始按鈕 */}
      <button
        type="button"
        onClick={onSpin}
        disabled={disabled}
        aria-label="開始抽籤"
        className="hub-button absolute left-1/2 top-1/2 z-10 flex aspect-square w-[22%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[5px] border-[#3B2A2A] bg-[#EF8DB0] text-[clamp(1.1rem,4.5vw,1.9rem)] font-black tracking-widest text-white"
      >
        <span className="hub-label">{n === 0 ? "完成" : spinning ? "…" : "開始"}</span>
      </button>
    </div>
  );
}

function DrawnList({ drawn }: { drawn: Entry[] }) {
  return (
    <div className="card w-full max-w-[560px] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black">🏆 已抽中名單</h2>
        <span className="rounded-full bg-[#EF8DB0] px-3 py-1 text-sm font-bold text-white">{drawn.length} 人</span>
      </div>
      {drawn.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-[#3B2A2A]/40 py-6 text-center opacity-70">
          還沒有人被抽中，按下轉盤中間的「開始」試試手氣！
        </p>
      ) : (
        <ol className="grid gap-2 sm:grid-cols-2">
          {drawn.map((e, i) => {
            const latest = i === drawn.length - 1;
            return (
              <li
                key={e.id}
                className={`flex items-center gap-3 rounded-2xl border-2 border-[#3B2A2A] px-3 py-2 font-bold ${
                  latest ? "drawn-latest bg-[#F7C948]" : "bg-white"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3B2A2A] text-sm text-white">
                  {i + 1}
                </span>
                <span className="truncate text-lg">{e.label}</span>
                {latest && <span className="ml-auto shrink-0 text-xs">最新</span>}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function WinnerModal({
  winner,
  order,
  remaining,
  onClose,
}: {
  winner: Entry;
  order: number;
  remaining: number;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" || e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#3B2A2A]/45 px-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-title"
    >
      <div
        className="winner-card card relative w-full max-w-sm px-8 pb-8 pt-10 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ribbon absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-8 py-1.5 text-lg font-black">
          第 {order} 位幸運兒
        </div>
        <p className="text-5xl">🎉</p>
        <h2 id="winner-title" className="mt-2 text-lg font-bold opacity-80">
          恭喜抽中
        </h2>
        <p className="title-text mt-2 break-all text-5xl font-black">{winner.label}</p>
        <p className="mt-4 text-sm opacity-70">
          {remaining > 0 ? `轉盤上還剩 ${remaining} 人` : "這是最後一位了！"}
        </p>
        <button type="button" onClick={onClose} autoFocus className="btn btn-pink mt-6 w-full text-lg">
          {remaining > 0 ? "繼續抽籤" : "完成"}
        </button>
      </div>
    </div>
  );
}

function ConfettiRain({ pieces }: { pieces: ConfettiPiece[] }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.round ? p.size : p.size * 0.45,
              background: p.color,
              borderRadius: p.round ? "9999px" : "2px",
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function Decorations() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {DECOR_CONFETTI.map((c, i) => (
        <span
          key={i}
          className="absolute rounded-sm border-[1.5px] border-[#3B2A2A]"
          style={{
            top: c.top,
            left: c.left,
            width: c.w,
            height: c.h,
            background: c.color,
            transform: `rotate(${c.rotate}deg)`,
          }}
        />
      ))}

      <Balloon className="left-[3%] top-[30%] hidden lg:block" color="#EF8DB0" />
      <Balloon className="left-[7%] top-[38%] hidden lg:block" color="#F7C948" delay="1.2s" />
      <Balloon className="right-[3%] top-[22%] hidden lg:block" color="#7CC6A4" delay="0.6s" />

      <svg className="absolute bottom-0 left-0 h-28 w-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path
          d="M0 60 C 150 10, 300 10, 450 50 S 750 100, 900 50 S 1100 10, 1200 40 L1200 120 L0 120 Z"
          fill="#9BD58A"
          stroke={INK}
          strokeWidth={3}
        />
      </svg>
    </div>
  );
}

function Balloon({ className, color, delay = "0s" }: { className: string; color: string; delay?: string }) {
  return (
    <div className={`balloon absolute w-16 ${className}`} style={{ animationDelay: delay }}>
      <svg viewBox="0 0 64 130">
        <path d="M32 78 C 28 95, 38 105, 30 128" fill="none" stroke={INK} strokeWidth={2} />
        <ellipse cx={32} cy={38} rx={26} ry={33} fill={color} stroke={INK} strokeWidth={3} />
        <path d="M27 70 L37 70 L32 78 Z" fill={color} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
        <ellipse cx={22} cy={24} rx={5} ry={9} fill="#FFFFFF" opacity={0.6} transform="rotate(-20 22 24)" />
      </svg>
    </div>
  );
}
