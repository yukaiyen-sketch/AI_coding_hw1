import type { PointerEvent as ReactPointerEvent, Ref } from "react";
import { fitText } from "@/lib/text";

export type Course = { id: string; name: string; fill: string; stroke: string };
export type Slots = Record<string, Course>;

export const DAYS = [
  { en: "MON", zh: "週一" },
  { en: "TUE", zh: "週二" },
  { en: "WED", zh: "週三" },
  { en: "THU", zh: "週四" },
  { en: "FRI", zh: "週五" },
];

export const PERIODS = [
  "08:10–09:00",
  "09:10–10:00",
  "10:10–11:00",
  "11:10–12:00",
  "13:10–14:00",
  "14:10–15:00",
  "15:10–16:00",
  "16:10–17:00",
];

export const slotKey = (day: number, period: number) => `${day}-${period}`;

// 版面尺寸（SVG 座標）
export const BOARD_W = 720;
const TABLE_X = 30;
const TABLE_Y = 122;
const TABLE_W = 660;
const LEFT_W = 120;
const HEAD_H = 60;
const ROW_H = 84;
const BREAK_H = 58;
const DAY_W = (TABLE_W - LEFT_W) / DAYS.length;
const TABLE_H = HEAD_H + PERIODS.length * ROW_H + BREAK_H;
export const BOARD_H = TABLE_Y + TABLE_H + 34;

const INK = "#8B5E57";
const LINE = "#E2B7B0";
const HEAD_FILL = "#F5CBC6";
const LEFT_FILL = "#FCE4E0";
const BREAK_FILL = "#C9978F";
const PAPER = "#FFF8F6";
export const BOARD_FONT = `"PingFang TC", "Noto Sans TC", "Microsoft JhengHei", system-ui, sans-serif`;

// 空格子裡的小愛心（固定位置）
const HEARTS = new Set(["0-1", "3-2", "1-4", "4-5", "2-7", "4-0"]);

const rowY = (p: number) => TABLE_Y + HEAD_H + p * ROW_H + (p >= 4 ? BREAK_H : 0);
const colX = (d: number) => TABLE_X + LEFT_W + d * DAY_W;

export default function TimetableBoard({
  svgRef,
  title,
  slots,
  hoverSlot,
  placing,
  onSlotPointerDown,
  onSlotClick,
  onSlotClear,
}: {
  svgRef: Ref<SVGSVGElement>;
  title: string;
  slots: Slots;
  hoverSlot: string | null;
  placing: boolean;
  onSlotPointerDown: (e: ReactPointerEvent, key: string) => void;
  onSlotClick: (key: string) => void;
  onSlotClear: (key: string) => void;
}) {
  const heading = fitText(title || "我的課表", 330, 30, 14);
  const topBottom = rowY(4) - BREAK_H;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
      fontFamily={BOARD_FONT}
      className="h-auto w-full select-none"
      role="img"
      aria-label={`${title}，週一到週五每天八節課`}
    >
      <defs>
        <clipPath id="table-clip">
          <rect x={TABLE_X} y={TABLE_Y} width={TABLE_W} height={TABLE_H} rx={20} />
        </clipPath>
      </defs>

      <rect width={BOARD_W} height={BOARD_H} rx={28} fill={PAPER} />

      {/* 標題框 */}
      <rect x={30} y={28} width={380} height={70} rx={35} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
      <path d="M78 96 L92 110 L100 96" fill="#FFFFFF" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <rect x={76} y={93} width={28} height={6} fill="#FFFFFF" />
      <text
        x={220}
        y={64}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={heading.fontSize}
        fontWeight={800}
        fill={INK}
      >
        {heading.text}
      </text>

      {/* 坐在課表上的小動物（頭先畫，讓表格壓住下緣） */}
      <Bunny cx={530} cy={TABLE_Y - 26} />
      <Bear cx={594} cy={TABLE_Y - 30} />
      <Bunny cx={658} cy={TABLE_Y - 26} />

      <g clipPath="url(#table-clip)">
        <rect x={TABLE_X} y={TABLE_Y} width={TABLE_W} height={TABLE_H} fill="#FFFFFF" />
        <rect x={TABLE_X} y={TABLE_Y} width={TABLE_W} height={HEAD_H} fill={HEAD_FILL} />
        <rect x={TABLE_X} y={TABLE_Y + HEAD_H} width={LEFT_W} height={TABLE_H - HEAD_H} fill={LEFT_FILL} />
        <rect x={TABLE_X} y={topBottom} width={TABLE_W} height={BREAK_H} fill={BREAK_FILL} />
      </g>

      {/* 表頭 */}
      <Bow cx={TABLE_X + LEFT_W / 2} cy={TABLE_Y + HEAD_H / 2} scale={1.25} color={INK} />
      {DAYS.map((d, i) => (
        <g key={d.en}>
          <text
            x={colX(i) + DAY_W / 2}
            y={TABLE_Y + 25}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={19}
            fontWeight={800}
            fill={INK}
            letterSpacing={1}
          >
            {d.en}
          </text>
          <text
            x={colX(i) + DAY_W / 2}
            y={TABLE_Y + 46}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fill={INK}
            opacity={0.75}
          >
            {d.zh}
          </text>
        </g>
      ))}

      {/* 節次 */}
      {PERIODS.map((time, p) => (
        <g key={time}>
          <text
            x={TABLE_X + LEFT_W / 2}
            y={rowY(p) + ROW_H / 2 - 10}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={28}
            fontWeight={800}
            fill={INK}
          >
            {p + 1}
          </text>
          <text
            x={TABLE_X + LEFT_W / 2}
            y={rowY(p) + ROW_H / 2 + 18}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fill={INK}
            opacity={0.8}
          >
            {time}
          </text>
        </g>
      ))}

      {/* 午休 */}
      <text
        x={TABLE_X + LEFT_W / 2}
        y={topBottom + BREAK_H / 2 - 8}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={18}
        fontWeight={800}
        fill="#FFFFFF"
        letterSpacing={4}
      >
        午休
      </text>
      <text
        x={TABLE_X + LEFT_W / 2}
        y={topBottom + BREAK_H / 2 + 13}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fill="#FFFFFF"
      >
        12:00–13:10
      </text>
      {Array.from({ length: 9 }, (_, i) => {
        const x = TABLE_X + LEFT_W + ((i + 0.5) * (TABLE_W - LEFT_W)) / 9;
        const y = topBottom + BREAK_H / 2;
        return i % 2 === 0 ? (
          <Bow key={i} cx={x} cy={y} scale={1} color="#FFFFFF" />
        ) : (
          <BunnyFace key={i} cx={x} cy={y} />
        );
      })}

      {/* 課程格子（裁切在圓角表格內） */}
      <g clipPath="url(#table-clip)">
      {PERIODS.map((_, p) =>
        DAYS.map((__, d) => {
          const key = slotKey(d, p);
          const course = slots[key];
          const x = colX(d);
          const y = rowY(p);
          const label = course ? fitText(course.name, DAY_W - 22, 24, 11) : null;
          return (
            <g
              key={key}
              data-slot={key}
              onPointerDown={course ? (e) => onSlotPointerDown(e, key) : undefined}
              onClick={() => onSlotClick(key)}
              style={{ cursor: course ? "grab" : placing ? "copy" : "default", touchAction: course ? "none" : "auto" }}
            >
              <rect x={x} y={y} width={DAY_W} height={ROW_H} fill="#FFFFFF" />
              {!course && HEARTS.has(key) && <Heart cx={x + DAY_W - 18} cy={y + ROW_H - 16} />}
              {course && label && (
                <>
                  <rect
                    x={x + 6}
                    y={y + 6}
                    width={DAY_W - 12}
                    height={ROW_H - 12}
                    rx={12}
                    fill={course.fill}
                    stroke={course.stroke}
                    strokeWidth={2.5}
                  />
                  <circle cx={x + DAY_W / 2} cy={y + 15} r={3.5} fill="#FFFFFF" stroke={course.stroke} strokeWidth={2} />
                  <text
                    x={x + DAY_W / 2}
                    y={y + ROW_H / 2 + 4}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={label.fontSize}
                    fontWeight={800}
                    fill="#5A3B36"
                    pointerEvents="none"
                  >
                    {label.text}
                  </text>
                </>
              )}
            </g>
          );
        }),
      )}
      </g>

      {/* 格線 */}
      <g stroke={LINE} strokeWidth={2}>
        {DAYS.map((_, d) => (
          <g key={d}>
            <line x1={colX(d)} y1={TABLE_Y} x2={colX(d)} y2={topBottom} />
            <line x1={colX(d)} y1={topBottom + BREAK_H} x2={colX(d)} y2={TABLE_Y + TABLE_H} />
          </g>
        ))}
        {PERIODS.map((_, p) =>
          p === 0 || p === 4 ? null : (
            <line key={p} x1={TABLE_X} y1={rowY(p)} x2={TABLE_X + TABLE_W} y2={rowY(p)} />
          ),
        )}
      </g>
      <g stroke={INK} strokeWidth={2.5}>
        <line x1={TABLE_X} y1={TABLE_Y + HEAD_H} x2={TABLE_X + TABLE_W} y2={TABLE_Y + HEAD_H} />
        <line x1={TABLE_X} y1={topBottom} x2={TABLE_X + TABLE_W} y2={topBottom} />
        <line x1={TABLE_X} y1={topBottom + BREAK_H} x2={TABLE_X + TABLE_W} y2={topBottom + BREAK_H} />
        <line x1={TABLE_X + LEFT_W} y1={TABLE_Y} x2={TABLE_X + LEFT_W} y2={topBottom} />
        <line x1={TABLE_X + LEFT_W} y1={topBottom + BREAK_H} x2={TABLE_X + LEFT_W} y2={TABLE_Y + TABLE_H} />
      </g>
      <rect x={TABLE_X} y={TABLE_Y} width={TABLE_W} height={TABLE_H} rx={20} fill="none" stroke={INK} strokeWidth={3.5} />

      {/* 小動物的手搭在表格上 */}
      {[530, 594, 658].map((cx) => (
        <g key={cx} fill="#FFFFFF" stroke={INK} strokeWidth={2}>
          <ellipse cx={cx - 12} cy={TABLE_Y} rx={8} ry={5.5} fill={cx === 594 ? "#B98A6E" : "#FFFFFF"} />
          <ellipse cx={cx + 12} cy={TABLE_Y} rx={8} ry={5.5} fill={cx === 594 ? "#B98A6E" : "#FFFFFF"} />
        </g>
      ))}

      {/* 以下僅在畫面上互動用，下載圖檔時會移除 */}
      {hoverSlot && <SlotHighlight slot={hoverSlot} />}
      {Object.keys(slots).map((key) => {
        const [d, p] = key.split("-").map(Number);
        const x = colX(d) + DAY_W - 12;
        const y = rowY(p) + 12;
        return (
          <g
            key={key}
            className="no-export"
            style={{ cursor: "pointer" }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onSlotClear(key);
            }}
            role="button"
            aria-label="移除這堂課"
          >
            <circle cx={x} cy={y} r={10} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
            <path d={`M${x - 4} ${y - 4} L${x + 4} ${y + 4} M${x + 4} ${y - 4} L${x - 4} ${y + 4}`} stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
}

function SlotHighlight({ slot }: { slot: string }) {
  const [d, p] = slot.split("-").map(Number);
  return (
    <rect
      className="no-export"
      x={colX(d) + 3}
      y={rowY(p) + 3}
      width={DAY_W - 6}
      height={ROW_H - 6}
      rx={12}
      fill="#F59CB0"
      fillOpacity={0.25}
      stroke="#E26D8A"
      strokeWidth={3}
      strokeDasharray="8 6"
      pointerEvents="none"
    />
  );
}

function Heart({ cx, cy }: { cx: number; cy: number }) {
  return (
    <path
      d={`M${cx} ${cy + 5} C ${cx - 9} ${cy - 1}, ${cx - 6} ${cy - 9}, ${cx} ${cy - 4} C ${cx + 6} ${cy - 9}, ${cx + 9} ${cy - 1}, ${cx} ${cy + 5} Z`}
      fill="#F7C1C6"
      pointerEvents="none"
    />
  );
}

function Bow({ cx, cy, scale, color }: { cx: number; cy: number; scale: number; color: string }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
      <path d="M-2 0 C -10 -10, -20 -10, -18 0 C -20 10, -10 10, -2 0 Z" />
      <path d="M2 0 C 10 -10, 20 -10, 18 0 C 20 10, 10 10, 2 0 Z" />
      <path d="M-2 2 L -8 14 M2 2 L 8 14" />
      <circle r={3} fill={color} />
    </g>
  );
}

function BunnyFace({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`} stroke={INK} strokeWidth={1.5}>
      <ellipse cx={-5} cy={-11} rx={3.5} ry={8} fill="#FFFFFF" />
      <ellipse cx={5} cy={-11} rx={3.5} ry={8} fill="#FFFFFF" />
      <ellipse cx={0} cy={2} rx={12} ry={9} fill="#FFFFFF" />
      <circle cx={-4} cy={1} r={1.4} fill={INK} stroke="none" />
      <circle cx={4} cy={1} r={1.4} fill={INK} stroke="none" />
    </g>
  );
}

function Bunny({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`} stroke={INK} strokeWidth={2.5}>
      <ellipse cx={-10} cy={-30} rx={7} ry={17} fill="#FFFFFF" />
      <ellipse cx={10} cy={-30} rx={7} ry={17} fill="#FFFFFF" />
      <ellipse cx={-10} cy={-28} rx={3} ry={10} fill="#F7C1C6" stroke="none" />
      <ellipse cx={10} cy={-28} rx={3} ry={10} fill="#F7C1C6" stroke="none" />
      <ellipse cx={0} cy={0} rx={30} ry={26} fill="#FFFFFF" />
      <Face />
    </g>
  );
}

function Bear({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`} stroke={INK} strokeWidth={2.5}>
      <circle cx={-21} cy={-20} r={10} fill="#B98A6E" />
      <circle cx={21} cy={-20} r={10} fill="#B98A6E" />
      <ellipse cx={0} cy={2} rx={31} ry={28} fill="#B98A6E" />
      <ellipse cx={0} cy={10} rx={11} ry={8} fill="#F2DCCB" stroke="none" />
      <Face />
    </g>
  );
}

function Face() {
  return (
    <g stroke="none">
      <circle cx={-9} cy={2} r={2.6} fill={INK} />
      <circle cx={9} cy={2} r={2.6} fill={INK} />
      <ellipse cx={-17} cy={9} rx={5} ry={3} fill="#F7A9B4" opacity={0.8} />
      <ellipse cx={17} cy={9} rx={5} ry={3} fill="#F7A9B4" opacity={0.8} />
      <path d="M-3 8 Q0 11 3 8" fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
    </g>
  );
}
