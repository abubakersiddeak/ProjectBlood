import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import connectDB from "./lib/dbConnect.js";
import { MessageModel } from "./models/message.js";
import { ChatModel } from "./models/chat.js";
import { UserModel } from "./models/user.js";

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

// Store online users and their rooms
const onlineUsers = new Map(); // userId -> socketId
const userRooms = new Map(); // userId -> Set of chatIds

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // User joins with their ID
  socket.on("user_online", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;

    if (!userRooms.has(userId)) {
      userRooms.set(userId, new Set());
    }

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

      // Join the socket to the room
      socket.join(chatId);

      // Track user's rooms
      if (!userRooms.has(senderId)) {
        userRooms.set(senderId, new Set());
      }
      userRooms.get(senderId).add(chatId);

      console.log(`✅ User ${senderId} joined chat room: ${chatId}`);

      // Send chatId back to client ✅
      socket.emit("chat_joined", { chatId });

      // Send chat history with user info
      const messages = await MessageModel.find({ chatId: chat._id })
        .sort({ createdAt: 1 })
        .limit(50)
        .populate("senderId", "fullName avatar")
        .lean();

      socket.emit("chat_history", messages);

      // Notify the other user to join if they're online ✅
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new_chat_request", {
          chatId,
          fromUser: senderId,
        });
      }
    } catch (err) {
      console.error("Error joining chat:", err);
      socket.emit("error", { message: "Failed to join chat" });
    }
  });

  // Handle new chat request ✅
  socket.on("accept_chat", async (data) => {
    try {
      const { chatId, userId } = data;

      socket.join(chatId);

      if (!userRooms.has(userId)) {
        userRooms.set(userId, new Set());
      }
      userRooms.get(userId).add(chatId);

      console.log(`✅ User ${userId} accepted and joined chat: ${chatId}`);

      // Send chat history
      const messages = await MessageModel.find({
        chatId: new mongoose.Types.ObjectId(chatId),
      })
        .sort({ createdAt: 1 })
        .limit(50)
        .populate("senderId", "fullName avatar")
        .lean();

      socket.emit("chat_history", messages);
    } catch (err) {
      console.error("Error accepting chat:", err);
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

      // Ensure sender is in the room ✅
      socket.join(roomId);

      // Ensure receiver is in the room if online ✅
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.sockets.sockets.get(receiverSocketId)?.join(roomId);
      }

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

      // Populate sender info
      const populatedMessage = await MessageModel.findById(newMessage._id)
        .populate("senderId", "fullName avatar")
        .lean();

      console.log(`📨 Broadcasting message to room ${roomId}`);

      // Emit to the entire room (both users) ✅
      io.to(roomId).emit("receive_message", populatedMessage);

      // Check if receiver is online for delivery status
      if (receiverSocketId) {
        await MessageModel.findByIdAndUpdate(newMessage._id, {
          status: "delivered",
        });
        io.to(roomId).emit("message_delivered", {
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
      userRooms.delete(socket.userId);
      io.emit("user_status", { userId: socket.userId, status: "offline" });
      console.log(`❌ User ${socket.userId} disconnected`);
    }
  });
});

app.get("/", (_req, res) => res.send("Socket.io Chat Server Running"));

server.listen(PORT, () =>
  console.log(`✅ Chat server running on port ${PORT}`),
);
