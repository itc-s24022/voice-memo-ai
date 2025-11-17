// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("✅ ログイン成功！");
      router.push("/dashboard");
    } catch (err: any) {
      setError("❌ ログイン失敗: " + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setMessage("");
    try {
      await signInWithPopup(auth, googleProvider);
      setMessage("✅ Googleログイン成功！");
      router.push("/dashboard");
    } catch (err: any) {
      setError("❌ Googleログイン失敗: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1>ログイン</h1>

      <form onSubmit={handleEmailLogin}>
        <div style={{ marginBottom: "1rem" }}>
          <label>メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <button type="submit" style={{ padding: "0.5rem 2rem" }}>
          ログイン
        </button>
      </form>

      <div style={{ margin: "1.5rem 0", textAlign: "center" }}>または</div>

      <button
        onClick={handleGoogleLogin}
        style={{
          width: "100%",
          padding: "1rem",
          background: "#4285f4",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          fontWeight: 600,
        }}
      >
        🔗 Googleでログイン
      </button>

      {message && (
        <p style={{ color: "green", marginTop: "1rem" }}>{message}</p>
      )}
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
}
