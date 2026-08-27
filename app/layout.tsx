import type { Metadata } from "next";
import "./globals.css";

export function generateMetadata(): Metadata {
  const siteUrl = process.env.GITHUB_ACTIONS === "true"
    ? "https://cumulocumulo.github.io/cs4620"
    : "http://localhost:3000";
  const image = `${siteUrl}/og.png`;
  const title = "CS4620 · 深入浅出计算机图形学";
  const description = "Cornell CS4620 计算机图形学中文自学重建版：26 份讲义、13 个 Part、7 个作业项目。";
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
