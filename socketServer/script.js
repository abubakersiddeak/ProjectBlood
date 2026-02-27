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

// Store online users: userId -> socketId
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // User joins with their ID
  socket.on("user_online", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    io.emit("user_status", { userId, status: "online" });
    console.log(`✅ User ${userId} is online (Socket: ${socket.id})`);
  });

  // Join chat room
  socket.on("join_chat", async (data) => {
    try {
      const { senderId, receiverId } = data;
      console.log(`🔵 join_chat requested by ${senderId} with ${receiverId}`);

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
        console.log(`🆕 New chat created: ${chat._id}`);
      }

      const chatId = chat._id.toString();

      // Join the socket to the room
      socket.join(chatId);
      console.log(
        `✅ Socket ${socket.id} (User: ${senderId}) joined room: ${chatId}`,
      );

      // Send chatId back to client
      socket.emit("chat_joined", { chatId });

      // Send chat history
      const messages = await MessageModel.find({ chatId: chat._id })
        .sort({ createdAt: 1 })
        .limit(50)
        .populate("senderId", "fullName avatar")
        .lean();

      socket.emit("chat_history", messages);
      console.log(`📜 Sent ${messages.length} messages to ${senderId}`);

      // If receiver is online, make them join too
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        const receiverSocket = io.sockets.sockets.get(receiverSocketId);
        if (receiverSocket) {
          receiverSocket.join(chatId);
          console.log(
            `✅ Auto-joined receiver socket ${receiverSocketId} (User: ${receiverId}) to room: ${chatId}`,
          );

          // Notify receiver
          receiverSocket.emit("chat_joined", { chatId });
          receiverSocket.emit("chat_history", messages);
        }
      }
    } catch (err) {
      console.error("❌ Error joining chat:", err);
      socket.emit("error", { message: "Failed to join chat" });
    }
  });

  // Handle new chat request
  socket.on("accept_chat", async (data) => {
    try {
      const { chatId, userId } = data;
      console.log(`✅ User ${userId} accepting chat: ${chatId}`);

      socket.join(chatId);
      console.log(`✅ Socket ${socket.id} joined room: ${chatId}`);

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
      console.error("❌ Error accepting chat:", err);
    }
  });

  // Send message
  socket.on("send_message", async (data) => {
    try {
      const { senderId, receiverId, text, chatId } = data;
      console.log(
        `📨 send_message from ${senderId} to ${receiverId}, chatId: ${chatId}`,
      );

      if (!text?.trim()) {
        console.log("❌ Empty message, ignoring");
        return;
      }

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
        console.log(`🆕 Created new chat: ${chat._id}`);
      }

      const roomId = chat._id.toString();

      // IMPORTANT: Make sure sender is in the room
      socket.join(roomId);
      console.log(`✅ Sender socket ${socket.id} joined room: ${roomId}`);

      // IMPORTANT: Make sure receiver is in the room if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        const receiverSocket = io.sockets.sockets.get(receiverSocketId);
        if (receiverSocket) {
          receiverSocket.join(roomId);
          console.log(
            `✅ Receiver socket ${receiverSocketId} joined room: ${roomId}`,
          );
        }
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

      // Get all sockets in the room
      const socketsInRoom = await io.in(roomId).fetchSockets();
      console.log(
        `📢 Broadcasting to room ${roomId}, sockets in room: ${socketsInRoom.length}`,
      );
      socketsInRoom.forEach((s) => console.log(`   - Socket: ${s.id}`));

      // Emit to the entire room
      io.to(roomId).emit("receive_message", populatedMessage);
      console.log(`✅ Message broadcasted to room ${roomId}`);

      // Check if receiver is online for delivery status
      if (receiverSocketId) {
        await MessageModel.findByIdAndUpdate(newMessage._id, {
          status: "delivered",
        });
        io.to(roomId).emit("message_delivered", {
          messageId: newMessage._id,
        });
        console.log(`✅ Message marked as delivered`);
      }

      // Emit typing stopped
      socket.to(roomId).emit("user_stopped_typing", { userId: senderId });
    } catch (err) {
      console.error("❌ Error sending message:", err);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on("typing", (data) => {
    const { chatId, userId } = data;
    console.log(`⌨️  User ${userId} typing in ${chatId}`);
    socket.to(chatId).emit("user_typing", { userId });
  });

  socket.on("stop_typing", (data) => {
    const { chatId, userId } = data;
    console.log(`⌨️  User ${userId} stopped typing in ${chatId}`);
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
        console.log(`✅ Message ${messageId} marked as read by ${userId}`);
      }
    } catch (err) {
      console.error("❌ Error marking message as read:", err);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("user_status", { userId: socket.userId, status: "offline" });
      console.log(
        `❌ User ${socket.userId} (Socket: ${socket.id}) disconnected`,
      );
    } else {
      console.log(`❌ Socket ${socket.id} disconnected`);
    }
  });
});

app.get("/", (_req, res) => res.send("Socket.io Chat Server Running"));

server.listen(PORT, () =>
  console.log(`✅ Chat server running on port ${PORT}`),
);
