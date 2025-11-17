// components/UploadButton.tsx
"use client";

import { auth } from "../lib/firebase";

export default function UploadButton() {
  const handleUpload = async (file: File) => {
    if (!auth.currentUser) return alert("ログインしてください");

    const token = await auth.currentUser.getIdToken();
    const formData = new FormData();
    formData.append("audio", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    console.log("アップロード結果:", data);
  };

  return (
    <input
      type="file"
      accept="audio/*"
      onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
    />
  );
}
