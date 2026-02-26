import ChatRoom from "@/components/shared/ChatRoom";
import React from "react";

export default function page() {
  const receiver = {
    id: "696ccd539cb1532f13ba1bbf",
    name: "jisan",
  };
  return (
    <div>
      <ChatRoom receiver={receiver} />
    </div>
  );
}
