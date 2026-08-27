import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const values = await headers();
  const host = values.get("host") || "localhost:3000";
  const proto = values.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const image = `${proto}://${host}/og.png`;
  const title = "CS4620 · 深入浅出计算机图形学";
  const description = "Cornell CS4620 计算机图形学中文自学重建版：26 份讲义、13 个 Part、7 个作业项目。";
  return {
    title, description,
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
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
