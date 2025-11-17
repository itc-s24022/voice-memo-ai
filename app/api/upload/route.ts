import { NextResponse } from "next/server";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Firebase 設定
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function POST(req: Request) {
  try {
    // 1️⃣ フロントから受け取る（音声URLやメールなど）
    const { audioUrl, transcript, summary, tags, email, password } = await req.json();

    // 2️⃣ Firebaseログイン → UID取得
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const uid = user.uid;
    

    console.log("✅ Firebase UID:", uid);

    // 3️⃣ microCMSへ登録
    const res = await fetch(`https://${process.env.MICROCMS_SERVICE}.microcms.io/api/v1/memos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MICROCMS-API-KEY": process.env.MICROCMS_API_KEY!,
      },
      body: JSON.stringify({
        user_id: uid,
        audio_url: audioUrl,
        transcript,
        summary,
        tags,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`microCMS Error: ${err}`);
    }

    const data = await res.json();

    console.log("送信データ:", {
      user_id: uid,
      audio_url: audioUrl,
      transcript,
      summary,
      tags,
    });

    return NextResponse.json({ success: true, uid, microcms: data });
  } catch (error: any) {
    console.error("❌ Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
