"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";

interface IMessage {
  _id?: string;
  chatId: string;
  senderId:
    | {
        _id: string;
        fullName: string;
        avatar?: string;
      }
    | string;
  text?: string;
  type?: string;
  status?: "sent" | "delivered" | "read";
  createdAt?: string;
}

interface IUser {
  id: string;
  name: string;
}

export default function ChatRoom({ receiver }: { receiver: IUser }) {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [chatId, setChatId] = useState<string>("");
  const { data: session } = useSession();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // ✅ Fixed: add initial value
  const socketRef = useRef<typeof Socket | null>(null); // ✅ Fixed: use Socket type directly

  const senderId = session?.user?.id;

  useEffect(() => {
    if (!senderId) return;

    // Initialize socket
    socketRef.current = io("https://bloodlinkbdsocketserver-1.onrender.com/", {
      transports: ["websocket"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
      socket.emit("user_online", senderId);

      // Join chat
      socket.emit("join_chat", {
        senderId,
        receiverId: receiver.id,
      });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    // Receive chat history
    socket.on("chat_history", (history: IMessage[]) => {
      setMessages(history);
      const firstMsg = history[0];
      if (firstMsg && typeof firstMsg.chatId === "string") {
        setChatId(firstMsg.chatId);
      }
    });

    // Receive new message
    socket.on("receive_message", (msg: IMessage) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === msg._id);
        if (exists) return prev;
        return [...prev, msg];
      });

      // Set chatId if not set
      if (!chatId && msg.chatId) {
        setChatId(msg.chatId);
      }

      // Mark as read if not sender
      const msgSenderId =
        typeof msg.senderId === "string" ? msg.senderId : msg.senderId._id;

      if (msgSenderId !== senderId && msg._id) {
        socket.emit("mark_as_read", {
          messageId: msg._id,
          userId: senderId,
        });
      }
    });

    // Typing indicators
    socket.on("user_typing", ({ userId }: { userId: string }) => {
      if (userId === receiver.id) {
        setIsTyping(true);
      }
    });

    socket.on("user_stopped_typing", ({ userId }: { userId: string }) => {
      if (userId === receiver.id) {
        setIsTyping(false);
      }
    });

    // Online status
    socket.on(
      "user_status",
      ({ userId, status }: { userId: string; status: string }) => {
        if (userId === receiver.id) {
          setIsOnline(status === "online");
        }
      },
    );

    // Message status updates
    socket.on("message_delivered", ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status: "delivered" } : msg,
        ),
      );
    });

    socket.on("message_read", ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status: "read" } : msg,
        ),
      );
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("chat_history");
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stopped_typing");
      socket.off("user_status");
      socket.off("message_delivered");
      socket.off("message_read");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [senderId, receiver.id, chatId]); // ✅ Added chatId to dependencies

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = () => {
    if (!chatId || !socketRef.current) return;

    socketRef.current.emit("typing", { chatId, userId: senderId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("stop_typing", { chatId, userId: senderId });
      }
    }, 1000);
  };

  const sendMessage = () => {
    if (!message.trim() || !senderId || !socketRef.current) return;

    socketRef.current.emit("send_message", {
      senderId: senderId,
      receiverId: receiver.id,
      text: message,
      chatId: chatId || undefined,
    });

    setMessage("");
    if (chatId && socketRef.current) {
      socketRef.current.emit("stop_typing", { chatId, userId: senderId });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMessageStatus = (msg: IMessage) => {
    if (!msg.status) return "";

    const msgSenderId =
      typeof msg.senderId === "string" ? msg.senderId : msg.senderId._id;

    if (msgSenderId !== senderId) return "";

    switch (msg.status) {
      case "sent":
        return "✓";
      case "delivered":
        return "✓✓";
      case "read":
        return "✓✓";
      default:
        return "";
    }
  };

  // Get sender name
  const getSenderName = (msg: IMessage) => {
    if (typeof msg.senderId === "string") {
      const msgSenderId = msg.senderId;
      if (msgSenderId === senderId) return "You";
      return receiver.name;
    } else {
      if (msg.senderId._id === senderId) return "You";
      return msg.senderId.fullName || receiver.name;
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#075e54",
          color: "white",
          padding: "15px",
          borderRadius: "8px 8px 0 0",
          marginBottom: "10px",
        }}
      >
        <h2 style={{ margin: 0 }}>{receiver.name}</h2>
        <small>
          {isConnected
            ? isOnline
              ? "🟢 Online"
              : "⚫ Offline"
            : "🔴 Connecting..."}
        </small>
      </div>

      {/* Messages Container */}
      <div
        style={{
          background: "#e5ddd5",
          padding: "20px",
          borderRadius: "0 0 8px 8px",
          minHeight: "400px",
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        {messages.length === 0 && (
          <p style={{ textAlign: "center" }}>No messages yet.</p>
        )}

        {messages.map((msg, index) => {
          const msgSenderId =
            typeof msg.senderId === "string" ? msg.senderId : msg.senderId._id;
          const isSender = msgSenderId === senderId;

          return (
            <div
              key={msg._id || index}
              style={{
                display: "flex",
                justifyContent: isSender ? "flex-end" : "flex-start",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  background: isSender ? "#dcf8c6" : "white",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  maxWidth: "70%",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                {!isSender && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#075e54",
                      fontWeight: "bold",
                      marginBottom: "4px",
                    }}
                  >
                    {getSenderName(msg)}
                  </div>
                )}
                <div>{msg.text}</div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#667781",
                    textAlign: "right",
                    marginTop: "4px",
                  }}
                >
                  {msg.createdAt &&
                    new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  {isSender && (
                    <span
                      style={{
                        marginLeft: "5px",
                        color: msg.status === "read" ? "#53bdeb" : "#667781",
                      }}
                    >
                      {getMessageStatus(msg)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div style={{ fontStyle: "italic", color: "#666" }}>
            {receiver.name} is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          gap: "10px",
        }}
      >
        <input
          placeholder={`Message ${receiver.name}`}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
          style={{
            flex: 1,
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "24px",
            outline: "none",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!isConnected || !message.trim()}
          style={{
            padding: "12px 24px",
            background: isConnected && message.trim() ? "#075e54" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "24px",
            cursor: isConnected && message.trim() ? "pointer" : "not-allowed",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
