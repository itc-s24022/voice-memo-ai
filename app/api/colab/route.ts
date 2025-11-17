// app/api/colab/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const colabUrl = process.env.COLAB_API_URL;

    if (!colabUrl || typeof colabUrl !== "string") {
      return NextResponse.json(
        { success: false, error: "Colab API URLが設定されていません" },
        { status: 500 }
      );
    }

    const contentType = request.headers.get("content-type");

    // FormData（音声ファイル）の場合
    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();

      const response = await fetch(`${colabUrl}/process`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      return NextResponse.json(data);
    }

    // JSON（テキスト）の場合
    const body = await request.json();

    if (!body.user_id) {
      return NextResponse.json(
        { success: false, error: "ユーザー認証が必要です" },
        { status: 401 }
      );
    }

    console.log("Colab処理開始 - User:", body.user_id);

    const response = await fetch(`${colabUrl}/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Colab API エラー: ${response.status}`);
    }

    const data = await response.json();
    console.log("Colab処理成功");

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Colab API エラー:", error);

    // error が Error の場合だけ message を取得
    const message =
      error instanceof Error ? error.message : "不明なエラーが発生しました";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
