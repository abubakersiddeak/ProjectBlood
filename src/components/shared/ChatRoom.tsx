"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import io from "socket.io-client";

// Socket instance
const socket = io("http://localhost:3001");

interface IMessage {
  _id?: string;
  chatId: string;
  senderId: string;
  text?: string;
  type?: string;
  createdAt?: string;
}

interface IUser {
  id: string;
  name: string;
}

export default function ChatRoom({ receiver }: { receiver: IUser }) {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { data: session } = useSession();

  const senderId = session?.user?.id;

  useEffect(() => {
    // Listen for messages
    socket.on("receive_message", (msg: IMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim() || !senderId) return;

    socket.emit("send_message", {
      senderId: senderId,
      receiverId: receiver.id, // receiver user id
      text: message,
    });
    setMessage("");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Next.js TypeScript Chat</h2>

      {/* Send Message */}
      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder={`Message to ${receiver.name}`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ padding: "8px", marginRight: "5px", width: "250px" }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "8px 15px",
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Send
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          background: "#f4f4f4",
          padding: "10px",
          borderRadius: "8px",
          minHeight: "100px",
        }}
      >
        {messages.length === 0 && <p>No messages yet.</p>}
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{ padding: "5px", borderBottom: "1px solid #ddd" }}
          >
            <strong>
              {msg.senderId === senderId ? "You" : receiver.name}:
            </strong>{" "}
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
}
