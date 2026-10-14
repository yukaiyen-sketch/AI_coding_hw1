@AGENTS.md

# 我的班級小工具 — 開發備忘

給 AI 助理與協作者看的專案慣例；使用說明請見 `README.md`。

## 專案概要

- 導師用的班級小工具集合，首頁 `src/app/page.tsx` 以 `TOOLS` 陣列列出各工具，會持續新增
- Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS v4，使用 npm
- 介面文字一律使用**繁體中文**；`<html lang="zh-Hant">`

## 慣例

- 每個工具一個路由資料夾：`page.tsx`（Server Component，只負責 `metadata` 與渲染）＋一個 Client Component 放互動邏輯
- 新工具要同步：加進首頁 `TOOLS`、頁面左上角放「← 回首頁」、更新 `README.md` 的工具一覽
- 各工具視覺風格各自獨立（轉盤＝藍底黃粉深描邊；課表＝粉色手帳風），自訂 class 與動畫放在 `globals.css` 並以工具區塊註解分隔
- 中文字型用系統字型（PingFang TC / Noto Sans TC / Microsoft JhengHei），不另載 Google Fonts 的 CJK 字型
- 不輕易加套件；繪圖優先用 SVG
- 文字放進固定寬度時用 `src/lib/text.ts` 的 `textEm` / `fitText`

## 實作注意

- **Tailwind v4 的 `translate-*` 用的是 CSS `translate` 屬性**，自訂 CSS 若再寫 `transform: translate(...)` 會疊加位移（轉盤中央按鈕踩過這個坑）
- 課表的拖曳是自製的 pointer events（非 HTML5 drag & drop），才能支援觸控；落點用 `elementFromPoint` + `[data-slot]` 判斷
- 課表下載：複製 SVG、移除 `.no-export` 元素、序列化成 data URL 後畫到 canvas 輸出 PNG。**SVG 內的顏色必須寫成屬性**（`fill`/`stroke`），不能靠 Tailwind class，否則匯出的圖會沒有顏色
- 隨機數只在事件處理中產生，避免 hydration 不一致；背景裝飾用固定座標
- 目前不做資料持久化（重新整理即重置）

## 驗證

改完至少跑：

```bash
npx tsc --noEmit
npm run lint
npm run build
```
