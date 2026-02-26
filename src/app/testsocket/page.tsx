import ChatRoom from "@/components/shared/ChatRoom";
import React from "react";

export default function page() {
  const receiver = {
    id: "696b4d35150b964a3bcd9869",
    name: "jisan",
  };
  return (
    <div>
      <ChatRoom receiver={receiver} />
    </div>
  );
}
