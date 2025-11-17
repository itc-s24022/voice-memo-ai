import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "user_id が必要です" },
        { status: 400 }
      );
    }

    const API_KEY = process.env.MICROCMS_API_KEY;
    const SERVICE_ID = process.env.MICROCMS_SERVICE_ID;

    const url = `https://${SERVICE_ID}.microcms.io/api/v1/memos?filters=user_id[equals]${userId}&limit=100&orders=-processed_at`;

    const response = await fetch(url, {
      headers: {
        "X-MICROCMS-API-KEY": API_KEY!,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("microCMS取得エラー");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("メモ取得エラー:", error);

    const message =
      error instanceof Error ? error.message : "不明なエラーが発生しました";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
