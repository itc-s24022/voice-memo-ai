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

interface UploadRequestBody {
  audioUrl: string;
  transcript: string;
  summary: string;
  tags: string[];
  email: string;
  password: string;
}

export async function POST(req: Request) {
  try {
    const { audioUrl, transcript, summary, tags, email, password } =
      (await req.json()) as UploadRequestBody;

    // Firebaseログイン
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;

    console.log("✅ Firebase UID:", uid);

    // microCMSへ登録
    const res = await fetch(
      `https://${process.env.MICROCMS_SERVICE}.microcms.io/api/v1/memos`,
      {
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
      }
    );

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
  } catch (error: unknown) {
    console.error("❌ Upload Error:", error);
    const message = error instanceof Error ? error.message : "不明なエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
