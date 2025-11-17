// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import SessionWrapper from "@/components/SessionWrapper";

export const metadata: Metadata = {
  title: "ボイスメモAI - 音声録音AI分析アプリ",
  description:
    "AIによる自動文字起こし・要約・タグ生成機能を備えたボイスメモアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          <SessionWrapper>{children}</SessionWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
