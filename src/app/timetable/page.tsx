import type { Metadata } from "next";
import TimetableMaker from "./TimetableMaker";

export const metadata: Metadata = {
  title: "製作我的課表",
  description: "拖曳課程掛牌排出一週課表，完成後下載成圖檔。",
};

export default function TimetablePage() {
  return <TimetableMaker />;
}
