"use client";
import { useState } from "react";
import { getAuth } from "firebase/auth";

export default function MemoForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function createMemo(title: string, content: string) {
    const user = getAuth().currentUser;
    if (!user) throw new Error("Not logged in");

    const token = await user.getIdToken();

    const res = await fetch("/api/memos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

    return await res.json();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createMemo(title, content);
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <input
        type="text"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <textarea
        placeholder="内容"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        保存
      </button>
    </form>
  );
}
