import "katex/dist/katex.min.css";
import "./styles.css";

export const metadata = {
  title: "学习工作台｜把每一道题真正弄明白",
  description: "可信题源、纸笔练习、确认后评分的本地数学学习工作台"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
