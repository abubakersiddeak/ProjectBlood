"use client";
import ChatRoom from "@/components/shared/ChatRoom";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const name = searchParams.get("name");
  const receiver = {
    id: userId,
    name: name,
  };

  return (
    <div>
      <ChatRoom receiver={receiver} />
    </div>
  );
}
