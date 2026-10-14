"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import TimetableBoard, { BOARD_H, BOARD_W, type Course, type Slots } from "./TimetableBoard";

const PALETTE = [
  { fill: "#FAD4D8", stroke: "#E58C9A" },
  { fill: "#CFE5F7", stroke: "#6FA3D0" },
  { fill: "#FCEBB6", stroke: "#D9AE3E" },
  { fill: "#D3EFD6", stroke: "#6DB57A" },
  { fill: "#E5D8F5", stroke: "#9C7FCB" },
  { fill: "#FDDCC4", stroke: "#E09A63" },
  { fill: "#CDEFEA", stroke: "#5DB3A6" },
  { fill: "#EADCD5", stroke: "#A88B80" },
];

const DEFAULT_COURSES: Course[] = ["國文", "英文", "數學", "理化", "生物"].map((name, i) => ({
  id: `default-${i}`,
  name,
  ...PALETTE[i],
}));

const MAX_NAME = 10;
const EXPORT_SCALE = 2;

type DragState = {
  course: Course;
  from?: string;
  startX: number;
  startY: number;
  active: boolean;
};

function slotAt(x: number, y: number) {
  const el = document.elementFromPoint(x, y);
  return el?.closest("[data-slot]")?.getAttribute("data-slot") ?? null;
}

export default function TimetableMaker() {
  const [courses, setCourses] = useState<Course[]>(DEFAULT_COURSES);
  const [slots, setSlots] = useState<Slots>({});
  const [title, setTitle] = useState("我的課表");
  const [newName, setNewName] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ghost, setGhost] = useState<{ course: Course; x: number; y: number } | null>(null);
  const [hoverSlot, setHoverSlot] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<DragState | null>(null);
  // 拖曳放開後瀏覽器可能再觸發一次 click，用來略過那一次
  const suppressClickRef = useRef(false);
  const nextColorRef = useRef(DEFAULT_COURSES.length);

  const selected = courses.find((c) => c.id === selectedId) ?? null;
  const filledCount = Object.keys(slots).length;

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag) return;
      if (!drag.active) {
        if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 6) return;
        drag.active = true;
      }
      e.preventDefault();
      setGhost({ course: drag.course, x: e.clientX, y: e.clientY });
      setHoverSlot(slotAt(e.clientX, e.clientY));
    }

    function onUp(e: PointerEvent) {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag?.active) return;

      const target = slotAt(e.clientX, e.clientY);
      setGhost(null);
      setHoverSlot(null);
      suppressClickRef.current = true;
      setTimeout(() => (suppressClickRef.current = false), 0);

      if (target === drag.from) return;
      setSlots((prev) => {
        const next = { ...prev };
        // 從課表拖出來：放到別格就是移動，拖到課表外就是移除
        if (drag.from) delete next[drag.from];
        if (target) next[target] = drag.course;
        return next;
      });
    }

    function onCancel() {
      dragRef.current = null;
      setGhost(null);
      setHoverSlot(null);
    }

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, []);

  function startDrag(e: ReactPointerEvent, course: Course, from?: string) {
    if (e.button !== 0) return;
    dragRef.current = { course, from, startX: e.clientX, startY: e.clientY, active: false };
  }

  function handleSlotPointerDown(e: ReactPointerEvent, key: string) {
    const course = slots[key];
    if (course) startDrag(e, course, key);
  }

  function handleSlotClick(key: string) {
    if (suppressClickRef.current || !selected) return;
    setSlots((prev) => ({ ...prev, [key]: selected }));
  }

  function clearSlot(key: string) {
    setSlots((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function addCourse() {
    const name = newName.trim();
    if (!name) {
      setNotice("請先輸入課程名稱。");
      return;
    }
    if (courses.some((c) => c.name === name)) {
      setNotice(`「${name}」已經有掛牌了。`);
      return;
    }
    const color = PALETTE[nextColorRef.current % PALETTE.length];
    nextColorRef.current += 1;
    setCourses((prev) => [...prev, { id: `c-${Date.now()}`, name, ...color }]);
    setNewName("");
    setNotice(`已新增「${name}」掛牌！`);
  }

  function removeCourse(id: string) {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function clearAll() {
    if (filledCount === 0) return;
    if (!window.confirm("確定要清空整張課表嗎？")) return;
    setSlots({});
    setNotice("課表已清空。");
  }

  async function downloadImage() {
    const svg = svgRef.current;
    if (!svg) return;
    setExporting(true);
    try {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.querySelectorAll(".no-export").forEach((n) => n.remove());
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("width", String(BOARD_W));
      clone.setAttribute("height", String(BOARD_H));

      const markup = new XMLSerializer().serializeToString(clone);
      const img = new Image();
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
      await img.decode();

      const canvas = document.createElement("canvas");
      canvas.width = BOARD_W * EXPORT_SCALE;
      canvas.height = BOARD_H * EXPORT_SCALE;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas 不支援");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("無法產生圖檔");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.trim() || "我的課表"}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("課表圖檔已產生，請查看瀏覽器的下載。");
    } catch {
      setNotice("產生圖檔失敗，請再試一次。");
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="timetable-bg flex-1 px-4 pb-16 pt-8 text-[#5A3B36] sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col">
        <Link
          href="/"
          className="self-start rounded-full border-2 border-[#8B5E57] bg-white px-4 py-1.5 text-sm font-bold shadow-[3px_3px_0_#E2B7B0] transition hover:-translate-y-0.5"
        >
          ← 回首頁
        </Link>

        <header className="mt-4 text-center">
          <h1 className="text-4xl font-black tracking-wider text-[#8B5E57] sm:text-5xl">製作我的課表</h1>
          <p className="mt-2 text-base opacity-80">把右邊的課程掛牌拖到課表上，排好後就能下載成圖片 ♡</p>
        </header>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <section className="flex justify-center">
            <div className="tt-card w-full max-w-[720px] overflow-hidden p-2 sm:p-3">
              <TimetableBoard
                svgRef={svgRef}
                title={title}
                slots={slots}
                hoverSlot={hoverSlot}
                placing={selected !== null}
                onSlotPointerDown={handleSlotPointerDown}
                onSlotClick={handleSlotClick}
                onSlotClear={clearSlot}
              />
            </div>
          </section>

          <aside className="tt-card order-first flex flex-col gap-6 p-6 lg:sticky lg:top-6 lg:order-none">
            <div className="flex flex-col gap-2">
              <label htmlFor="tt-title" className="font-bold">
                課表名稱
              </label>
              <input
                id="tt-title"
                value={title}
                maxLength={16}
                onChange={(e) => setTitle(e.target.value)}
                className="tt-input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">課程掛牌</h2>
                <span className="rounded-full bg-[#F5CBC6] px-3 py-0.5 text-sm font-bold">
                  已排 {filledCount} / 40 堂
                </span>
              </div>
              <p className="text-sm opacity-75">
                拖曳掛牌到課表的時段；或先點一下掛牌，再點課表格子。已排好的課可以拖到別格，拖出課表外或按 × 就會移除。
              </p>
              <ul className="mt-1 flex flex-wrap gap-3">
                {courses.map((c) => (
                  <li key={c.id} className="relative">
                    <button
                      type="button"
                      onPointerDown={(e) => startDrag(e, c)}
                      onClick={() => {
                        if (suppressClickRef.current) return;
                        setSelectedId((id) => (id === c.id ? null : c.id));
                      }}
                      aria-pressed={selectedId === c.id}
                      className={`course-tag ${selectedId === c.id ? "is-selected" : ""}`}
                      style={{ background: c.fill, borderColor: c.stroke, color: "#5A3B36" }}
                    >
                      <span className="course-tag-hole" style={{ borderColor: c.stroke }} />
                      {c.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCourse(c.id)}
                      aria-label={`刪除「${c.name}」掛牌`}
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#8B5E57] bg-white text-xs font-black leading-none"
                    >
                      ×
                    </button>
                  </li>
                ))}
                {courses.length === 0 && <li className="text-sm opacity-70">目前沒有掛牌，請在下面新增課程。</li>}
              </ul>
              {selected && (
                <p className="rounded-xl bg-[#FCE4E0] px-3 py-2 text-sm font-bold">
                  已選「{selected.name}」，點課表格子就能放上去（再點一次掛牌取消）。
                </p>
              )}
            </div>

            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addCourse();
              }}
            >
              <label htmlFor="tt-new" className="font-bold">
                新增課程
              </label>
              <div className="flex gap-2">
                <input
                  id="tt-new"
                  value={newName}
                  maxLength={MAX_NAME}
                  placeholder="例如：歷史、體育"
                  onChange={(e) => setNewName(e.target.value)}
                  className="tt-input min-w-0 flex-1"
                />
                <button type="submit" className="tt-btn tt-btn-pink shrink-0">
                  ＋ 新增
                </button>
              </div>
            </form>

            <div className="flex flex-col gap-3">
              <button type="button" onClick={downloadImage} disabled={exporting} className="tt-btn tt-btn-brown text-lg">
                {exporting ? "產生中…" : "⬇ 完成！下載課表圖檔"}
              </button>
              <button
                type="button"
                onClick={clearAll}
                disabled={filledCount === 0}
                className="tt-btn tt-btn-white"
              >
                清空課表
              </button>
            </div>

            {notice && (
              <p role="status" className="rounded-xl bg-[#FFF1EE] px-3 py-2 text-sm font-bold">
                {notice}
              </p>
            )}
          </aside>
        </div>
      </div>

      {ghost && (
        <div
          aria-hidden
          className="course-tag is-ghost pointer-events-none fixed z-50"
          style={{
            left: ghost.x,
            top: ghost.y,
            background: ghost.course.fill,
            borderColor: ghost.course.stroke,
            color: "#5A3B36",
          }}
        >
          <span className="course-tag-hole" style={{ borderColor: ghost.course.stroke }} />
          {ghost.course.name}
        </div>
      )}
    </main>
  );
}
