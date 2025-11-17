"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

type Memo = {
  id: string;
  summary: string;
  tags: string[];
  processed_at: string;
  transcript: string;
};

export default function Dashboard() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enableGdriveBackup, setEnableGdriveBackup] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const { data: session } = useSession();
  const router = useRouter();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Firebase Googleログイン判定
  const isGoogleLogin = user?.providerData?.[0]?.providerId === "google.com";

  // メモ取得
  const fetchMemos = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/memos?user_id=${user.uid}`);
      const data = await res.json();
      setMemos(data.contents || []);
      setLoading(false);
    } catch (error) {
      console.error("メモ取得エラー:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchMemos();
  }, [user, authLoading, router]);

  // Google Drive認証
  const connectGoogleDrive = () => {
    signIn("google");
  };

  // 録音開始
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("録音エラー:", error);
      alert("マイクアクセスが拒否されました");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAudioBlob(file);
  };

  // 音声処理
  const processAudio = async () => {
    if (!audioBlob || !user) return;
    setIsProcessing(true);

    try {
      let driveUrl = "";

      // Google Driveバックアップ（Firebase Googleログインはスキップ）
      if (!isGoogleLogin && enableGdriveBackup && session?.accessToken) {
        const driveFormData = new FormData();
        driveFormData.append("file", audioBlob);
        driveFormData.append("filename", `${Date.now()}.webm`);

        const driveRes = await fetch("/api/gdrive/upload", {
          method: "POST",
          body: driveFormData,
        });

        if (driveRes.ok) {
          const driveData = await driveRes.json();
          driveUrl = driveData.url;
        }
      }

      // Colab処理
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("user_id", user.uid);

      const res = await fetch("/api/colab", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        if (driveUrl && data.content_id) {
          await fetch(`/api/memos/${data.content_id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio_url: driveUrl }),
          });
        }
        alert("完了しました");
        setAudioBlob(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchMemos();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert("エラー:" + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || loading) {
    return <div style={{ padding: "2rem" }}>読み込み中...</div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* ヘッダー */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1>📝 ボイスメモ一覧</h1>
          <p style={{ color: "#666" }}>
            👤 {user?.email} ({memos.length}件)
          </p>
        </div>
        <Link
          href="/dashboard/new"
          style={{
            padding: "1rem 2rem",
            background: "#667eea",
            color: "white",
            borderRadius: "0.5rem",
          }}
        >
          ➕ テキスト入力
        </Link>
      </div>

      {/* Google Drive 連携（メールPWログインのみ表示） */}
      {!isGoogleLogin && (
        <div
          style={{
            marginBottom: "2rem",
            padding: "1.5rem",
            background: session ? "#d1fae5" : "#fee2e2",
            borderRadius: "1rem",
          }}
        >
          {session ? (
            <div>
              <p style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                ✅ Google Drive連携済み
              </p>
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  type="checkbox"
                  checked={enableGdriveBackup}
                  onChange={(e) => setEnableGdriveBackup(e.target.checked)}
                  style={{ width: "20px", height: "20px" }}
                />
                <span>💾 音声をDriveに保存する</span>
              </label>
            </div>
          ) : (
            <div>
              <p style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                ⚠️ Google Drive未連携
              </p>
              <button
                onClick={connectGoogleDrive}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#4285f4",
                  color: "white",
                  borderRadius: "0.5rem",
                }}
              >
                🔗 Driveと連携
              </button>
            </div>
          )}
        </div>
      )}

      {/* 録音セクション */}
      <div
        style={{
          marginBottom: "3rem",
          padding: "2rem",
          background: "#f9fafb",
          borderRadius: "1rem",
        }}
      >
        <h2 style={{ marginBottom: "1.5rem" }}>🎙️ 音声入力</h2>

        {/* 録音 */}
        <div style={{ marginBottom: "1.5rem" }}>
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isProcessing}
              style={{
                padding: "1rem 2rem",
                background: "#ef4444",
                color: "white",
                borderRadius: "0.5rem",
              }}
            >
              🔴 録音開始
            </button>
          ) : (
            <button
              onClick={stopRecording}
              style={{
                padding: "1rem 2rem",
                background: "#6b7280",
                color: "white",
                borderRadius: "0.5rem",
              }}
            >
              ⏹️ 停止
            </button>
          )}
        </div>

        {/* アップロード */}
        <div style={{ marginBottom: "1.5rem" }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            disabled={isProcessing || isRecording}
            style={{
              padding: "0.5rem",
              border: "2px solid #e5e7eb",
              borderRadius: "0.5rem",
              width: "100%",
            }}
          />
        </div>

        {/* 処理 */}
        {audioBlob && !isRecording && (
          <div>
            <audio
              controls
              src={URL.createObjectURL(audioBlob)}
              style={{ width: "100%", marginBottom: "1rem" }}
            />
            <button
              onClick={processAudio}
              disabled={isProcessing}
              style={{
                padding: "1rem 2rem",
                background: "#10b981",
                color: "white",
                borderRadius: "0.5rem",
                width: "100%",
              }}
            >
              {isProcessing ? "⏳ 処理中…" : "🚀 音声を処理する"}
            </button>
          </div>
        )}
      </div>

      {/* メモ一覧 */}
      {memos.length === 0 ? (
        <div
          style={{
            padding: "3rem",
            textAlign: "center",
            background: "#f9fafb",
            borderRadius: "1rem",
          }}
        >
          <p>まだメモがありません</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {memos.map((memo) => (
            <div
              key={memo.id}
              style={{
                padding: "1.5rem",
                background: "white",
                borderRadius: "0.75rem",
                cursor: "pointer",
              }}
              onClick={() => router.push(`/dashboard/${memo.id}`)}
            >
              <p style={{ fontSize: "0.875rem", color: "#666" }}>
                {new Date(memo.processed_at).toLocaleDateString("ja-JP")}
              </p>
              <p style={{ fontWeight: "600" }}>{memo.summary}</p>
              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                {memo.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "0.25rem 0.75rem",
                      background: "#dbeafe",
                      color: "#1e40af",
                      borderRadius: "1rem",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
