import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import connectDB from "./lib/dbConnect.js";
import { MessageModel } from "./models/message.js";
import { ChatModel } from "./models/chat.js";
const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);
connectDB();

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://project-blood-psi.vercel.app/"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Send message
  socket.on("send_message", async (data) => {
    try {
      const { senderId, receiverId, text } = data;

      // 1️⃣ Check if chat exists between these two users
      let chat = await ChatModel.findOne({
        participants: {
          $all: [
            new mongoose.Types.ObjectId(senderId),
            new mongoose.Types.ObjectId(receiverId),
          ],
        },
      });

      // 2️⃣ Create new chat if not exists
      if (!chat) {
        chat = await ChatModel.create({
          participants: [
            new mongoose.Types.ObjectId(senderId),
            new mongoose.Types.ObjectId(receiverId),
          ],
        });
        console.log("New chat created:", chat._id.toString());
      }

      const chatId = chat._id.toString();

      // 3️⃣ Join sender to room automatically
      socket.join(chatId);

      // 4️⃣ Save message
      const newMessage = await MessageModel.create({
        chatId: chat._id,
        senderId: new mongoose.Types.ObjectId(senderId),
        text: text,
        readBy: [new mongoose.Types.ObjectId(senderId)],
      });

      // 5️⃣ Update lastMessage in chat
      chat.lastMessage = newMessage._id;
      await chat.save();

      // 6️⃣ Broadcast message to room
      io.to(chatId).emit("receive_message", newMessage);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

app.get("/", (_req, res) => res.send("Socket.io Chat Server Running"));

server.listen(PORT, () => console.log("✅ Chat server running on port 3001"));
