import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import connectDB from "./lib/dbConnect.js";
import { MessageModel } from "./models/message.js";
import { ChatModel } from "./models/chat.js";
import { UserModel } from "./models/user.js"; // ✅ Import User Model

const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);
connectDB();

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://project-blood-psi.vercel.app"],
    credentials: true,
  },
});

// Store online users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // User joins with their ID
  socket.on("user_online", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    io.emit("user_status", { userId, status: "online" });
    console.log(`User ${userId} is online`);
  });

  // Join chat room
  socket.on("join_chat", async (data) => {
    try {
      const { senderId, receiverId } = data;

      let chat = await ChatModel.findOne({
        participants: {
          $all: [
            new mongoose.Types.ObjectId(senderId),
            new mongoose.Types.ObjectId(receiverId),
          ],
        },
      });

      if (!chat) {
        chat = await ChatModel.create({
          participants: [
            new mongoose.Types.ObjectId(senderId),
            new mongoose.Types.ObjectId(receiverId),
          ],
        });
      }

      const chatId = chat._id.toString();
      socket.join(chatId);

      // Send chat history with user info ✅
      const messages = await MessageModel.find({ chatId: chat._id })
        .sort({ createdAt: 1 })
        .limit(50)
        .populate("senderId", "fullName avatar") // ✅ Populate user data
        .lean();

      socket.emit("chat_history", messages);
      console.log(`User joined chat: ${chatId}`);
    } catch (err) {
      console.error("Error joining chat:", err);
    }
  });

  // Send message
  socket.on("send_message", async (data) => {
    try {
      const { senderId, receiverId, text, chatId } = data;

      if (!text?.trim()) return;

      let chat;
      if (chatId) {
        chat = await ChatModel.findById(chatId);
      } else {
        chat = await ChatModel.findOne({
          participants: {
            $all: [
              new mongoose.Types.ObjectId(senderId),
              new mongoose.Types.ObjectId(receiverId),
            ],
          },
        });
      }

      if (!chat) {
        chat = await ChatModel.create({
          participants: [
            new mongoose.Types.ObjectId(senderId),
            new mongoose.Types.ObjectId(receiverId),
          ],
        });
      }

      const roomId = chat._id.toString();
      socket.join(roomId);

      // Create message
      const newMessage = await MessageModel.create({
        chatId: chat._id,
        senderId: new mongoose.Types.ObjectId(senderId),
        text: text.trim(),
        readBy: [new mongoose.Types.ObjectId(senderId)],
        status: "sent",
      });

      // Update chat
      chat.lastMessage = newMessage._id;
      await chat.save();

      // Populate sender info ✅
      const populatedMessage = await MessageModel.findById(newMessage._id)
        .populate("senderId", "fullName avatar") // ✅ Get user name and avatar
        .lean();

      // Emit to room
      io.to(roomId).emit("receive_message", populatedMessage);

      // Check if receiver is online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        // Mark as delivered
        await MessageModel.findByIdAndUpdate(newMessage._id, {
          status: "delivered",
        });
        io.to(receiverSocketId).emit("message_delivered", {
          messageId: newMessage._id,
        });
      }

      // Emit typing stopped
      socket.to(roomId).emit("user_stopped_typing", { userId: senderId });
    } catch (err) {
      console.error("Error sending message:", err);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on("typing", (data) => {
    const { chatId, userId } = data;
    socket.to(chatId).emit("user_typing", { userId });
  });

  socket.on("stop_typing", (data) => {
    const { chatId, userId } = data;
    socket.to(chatId).emit("user_stopped_typing", { userId });
  });

  // Message read
  socket.on("mark_as_read", async (data) => {
    try {
      const { messageId, userId } = data;

      const message = await MessageModel.findById(messageId);
      if (message && !message.readBy.includes(userId)) {
        message.readBy.push(new mongoose.Types.ObjectId(userId));
        message.status = "read";
        await message.save();

        io.to(message.chatId.toString()).emit("message_read", {
          messageId,
          userId,
        });
      }
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("user_status", { userId: socket.userId, status: "offline" });
      console.log(`❌ User ${socket.userId} disconnected`);
    }
  });
});

app.get("/", (_req, res) => res.send("Socket.io Chat Server Running"));

server.listen(PORT, () =>
  console.log(`✅ Chat server running on port ${PORT}`),
);
