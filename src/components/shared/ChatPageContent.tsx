"use client";

import { useSearchParams } from "next/navigation";
import ChatRoom from "./ChatRoom";

export default function ChatPageContent() {
  const searchParams = useSearchParams();

  const userId = searchParams.get("userId");
  const name = searchParams.get("name");

  if (!userId || !name) {
    return <div>Invalid user</div>;
  }

  const receiver = {
    id: userId,
    name: name,
  };

  return <ChatRoom receiver={receiver} />;
}
