// fromtEnd_kadai/memo/voice-memo-ai/components/SessionWrapper.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export default function SessionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
