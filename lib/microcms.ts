const API_KEY = process.env.MICROCMS_API_KEY!;
const SERVICE_ID = process.env.MICROCMS_SERVICE_ID!;
const BASE_URL = `https://${SERVICE_ID}.microcms.io/api/v1`;

export type Memo = {
  id: string;
  audio_url: string;
  transcript: string;
  summary: string;
  tags: string[];
  user_id: string;
  processed_at: string;
  duration_seconds?: number;
};

export async function getMemosByUser(uid: string): Promise<Memo[]> {
  const res = await fetch(
    `${BASE_URL}/memos?filters=user_id[equals]${uid}&orders=-processed_at`,
    {
      headers: { "X-MICROCMS-API-KEY": API_KEY },
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error("Failed to fetch memos for user");
  const data = (await res.json()) as { contents: Memo[] };
  return data.contents;
}

export async function createMemo(data: Omit<Memo, "id">) {
  const res = await fetch(`${BASE_URL}/memos`, {
    method: "POST",
    headers: {
      "X-MICROCMS-API-KEY": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create memo");
  return res.json();
}
