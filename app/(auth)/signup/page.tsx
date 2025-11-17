"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { FirebaseError } from "firebase/app";  // ← ここからインポート

import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("✅ 登録成功！ダッシュボードに移動します");
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as FirebaseError;
      switch (error.code) {
        case "auth/email-already-in-use":
          setError("このメールアドレスは既に登録されています");
          break;
        case "auth/invalid-email":
          setError("メールアドレスの形式が正しくありません");
          break;
        case "auth/weak-password":
          setError("パスワードは6文字以上で設定してください");
          break;
        default:
          setError("登録に失敗しました: " + (error.message ?? "不明なエラー"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      alert("✅ Googleで登録成功！");
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as FirebaseError;
      setError("❌ Google登録失敗: " + (error.message ?? "不明なエラー"));
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "3rem",
          borderRadius: "1rem",
          maxWidth: "400px",
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <h1
          style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "#667eea" }}
        >
          新規登録
        </h1>

        {error && (
          <div
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              background: "#fee",
              color: "#c00",
              borderRadius: "0.5rem",
              border: "1px solid #fcc",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignup}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
              }}
              placeholder="example@email.com"
            />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
              }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "1rem",
              background: loading ? "#ccc" : "#667eea",
              color: "white",
              borderRadius: "0.5rem",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            {loading ? "登録中..." : "登録"}
          </button>
        </form>

        <div style={{ margin: "1.5rem 0", textAlign: "center" }}>または</div>

        <button
          onClick={handleGoogleSignup}
          style={{
            width: "100%",
            padding: "1rem",
            background: "#4285f4",
            color: "white",
            borderRadius: "0.5rem",
            fontWeight: 600,
          }}
        >
          🔗 Googleで登録 / ログイン
        </button>

        <p style={{ textAlign: "center", color: "#666", marginTop: "1rem" }}>
          既にアカウントをお持ちですか？{" "}
          <Link href="/login" style={{ color: "#667eea", fontWeight: 600 }}>
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
