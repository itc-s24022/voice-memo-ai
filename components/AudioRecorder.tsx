"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface ProcessResult {
  success: boolean;
  summary: string;
  tags: string[];
  transcript: string;
}

export default function AudioRecorder() {
  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>読み込み中...</div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const processText = async () => {
    if (!textInput.trim()) return alert("テキストを入力してください");

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch("/api/colab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput, user_id: user.uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `処理エラー: ${response.status}`);
      }

      const data = (await response.json()) as ProcessResult & {
        success: boolean;
      };

      if (data.success) {
        setResult(data);
        setTextInput("");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        throw new Error("処理に失敗しました");
      }
    } catch (error: unknown) {
      console.error("処理エラー:", error);
      const message = error instanceof Error ? error.message : "不明なエラー";
      alert("❌ エラー: " + message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          background: "#e0f2fe",
          borderRadius: "0.5rem",
        }}
      >
        <p>👤 ログイン中: {user.email}</p>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>UID: {user.uid}</p>
      </div>

      <h2 style={{ marginBottom: "2rem" }}>🎤 ボイスメモ作成</h2>

      <div
        style={{
          padding: "1.5rem",
          background: "#f9fafb",
          borderRadius: "0.75rem",
        }}
      >
        <h3 style={{ marginBottom: "1rem" }}>📝 テキスト入力</h3>
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="メモを入力してください..."
          style={{
            width: "100%",
            minHeight: "120px",
            padding: "1rem",
            border: "2px solid #e5e7eb",
            borderRadius: "0.5rem",
            fontSize: "1rem",
            marginBottom: "1rem",
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={processText}
          disabled={isProcessing || !textInput.trim()}
          style={{
            padding: "1rem 2rem",
            background: isProcessing || !textInput.trim() ? "#ccc" : "#10b981",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            fontSize: "1.1rem",
            cursor:
              isProcessing || !textInput.trim() ? "not-allowed" : "pointer",
            width: "100%",
          }}
        >
          {isProcessing ? "⏳ AI処理中..." : "🚀 テキストを処理"}
        </button>
      </div>

      {isProcessing && (
        <div
          style={{
            padding: "1.5rem",
            background: "#dbeafe",
            borderRadius: "0.5rem",
            marginTop: "1rem",
          }}
        >
          <p>⏳ AI処理中...</p>
          <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
            要約生成 → タグ生成 → 埋め込みベクトル → microCMS保存
          </p>
        </div>
      )}

      {result && (
        <div
          style={{
            padding: "1.5rem",
            background: "#d1fae5",
            borderRadius: "0.5rem",
            marginTop: "1rem",
          }}
        >
          <h3>✅ 処理完了</h3>
          <p>
            <strong>要約:</strong> {result.summary}
          </p>
          <p>
            <strong>タグ:</strong> {result.tags.join(" ")}
          </p>
          <p>
            <strong>元のテキスト:</strong> {result.transcript.substring(0, 100)}
            ...
          </p>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#666" }}>
            2秒後にダッシュボードに戻ります...
          </p>
        </div>
      )}
    </div>
  );
}
