import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.MICROCMS_API_KEY!;
const SERVICE_ID = process.env.MICROCMS_SERVICE_ID!;

// メモ取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = `https://${SERVICE_ID}.microcms.io/api/v1/memos/${params.id}`;

    const response = await fetch(url, {
      headers: {
        'X-MICROCMS-API-KEY': API_KEY,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('メモの取得に失敗しました');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('メモ取得エラー:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// メモ更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const url = `https://${SERVICE_ID}.microcms.io/api/v1/memos/${params.id}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'X-MICROCMS-API-KEY': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('メモの更新に失敗しました');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('メモ更新エラー:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// メモ削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = `https://${SERVICE_ID}.microcms.io/api/v1/memos/${params.id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'X-MICROCMS-API-KEY': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('メモの削除に失敗しました');
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('メモ削除エラー:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
