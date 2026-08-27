import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";

export function generateMetadata(): Metadata {
  const siteUrl = process.env.GITHUB_ACTIONS === "true"
    ? "https://cumulocumulo.github.io/cs4620"
    : "http://localhost:3000";
  const image = `${siteUrl}/og.png`;
  const title = "深入浅出计算机图形学 · 教材与 CS4620 双版本";
  const description = "完整中文图形学教材与 Cornell CS4620 双路线自学站：23 章教材、26 份讲义和 7 个作业项目。";
  return {
    title, description,
    metadataBase: new URL(siteUrl),
    icons: { icon: `${siteUrl}/favicon.svg`, shortcut: `${siteUrl}/favicon.svg` },
    openGraph: { title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
