const express = require("express");
const { authRouter } = require("./routes/auth-route");
const { userRouter } = require("./routes/user-route");
const connect = require("./connection.cjs");
const { authMiddleware } = require("./middleware/authMiddleware");
const messageModel = require("./model/messageModel");
const { Server } = require("socket.io");

const app = express();
const server = require("http").createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      "https://chat-application-c76jglggt-pankaj-parihars-projects.vercel.app/", // React app's URL
    methods: ["GET", "POST"],
  },
});

const cors = require("cors");
require("dotenv").config();
connect();

app.use(express.json());
app.use(cors());

app.use(authRouter);
app.use(userRouter);

app.get("/", (req, res) => {
  res.json({ msg: "Hello World" });
});

app.get("/messages/:room", authMiddleware, async (req, res) => {
  const { room } = req.params;

  console.log("room--->" + room);
  try {
    const messages = await messageModel.find({ room }).sort({ timestamp: 1 });
    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).send("Failed to fetch messages");
  }
});

const onlineUsers = new Map();
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user joining the room and tracking their online status
  socket.on("user_connected", (userId) => {
    onlineUsers.set(userId, socket.id); // Add the user to the online list
    console.log(`User ${userId} is online`);
    io.emit("update_online_status", Array.from(onlineUsers.keys()));
  });

  // User joins a specific chat room
  socket.on("join_room", ({ sender, receiver }) => {
    const room = [sender, receiver].sort().join("_");
    socket.join(room);
    console.log(`${sender} joined room ${room}`);
  });

  // Typing event
  socket.on("typing", ({ room, userId }) => {
    socket.to(room).emit("user_typing", { userId });
  });

  // Stop typing event
  socket.on("stop_typing", ({ room, userId }) => {
    socket.to(room).emit("user_stopped_typing", { userId });
  });

  // Handle sending and saving messages
  socket.on("send_message", async (data) => {
    const { sender, receiver, message } = data;
    const room = [sender, receiver].sort().join("_");

    // Save the message to MongoDB
    const newMessage = new messageModel({ sender, receiver, room, message });
    await newMessage.save();

    // Emit message to the room
    io.to(room).emit("receive_message", {
      sender,
      message,
      timestamp: newMessage.timestamp,
    });
  });

  // Handle disconnection and update the online status
  socket.on("disconnect", () => {
    const userId = Array.from(onlineUsers.entries()).find(
      ([, socketId]) => socketId === socket.id
    )?.[0];

    if (userId) {
      onlineUsers.delete(userId);
      console.log(`User ${userId} went offline`);
      io.emit("update_online_status", Array.from(onlineUsers.keys()));
    }

    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, (req, res) => {
  console.log("Server running on 3000");
});
