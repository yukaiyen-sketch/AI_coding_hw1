import type { Metadata } from "next";
import LuckyWheel from "./LuckyWheel";

export const metadata: Metadata = {
  title: "轉轉樂｜班級抽籤小轉盤",
  description: "班級抽籤用的幸運轉盤，可自訂名單、抽過的人自動移除。",
};

export default function LotteryPage() {
  return <LuckyWheel />;
}
