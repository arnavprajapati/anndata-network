import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.route.js';
import donationRoutes from './routes/donation.routes.js';

// NEW IMPORTS FOR SOCKET.IO
import http from "http";
import { Server } from "socket.io";

// Load environment variables
dotenv.config();

const app = express();

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------- DATABASE ----------
connectDB();

// ---------- ROUTES ----------
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);

// ---------- ERROR HANDLER ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ---------- SOCKET.IO SETUP (ADDED) ----------
const server = http.createServer(app);  // <-- IMPORTANT: Use HTTP server

const io = new Server(server, {
  cors: {
    origin: "*", // later replace with: "http://localhost:5173"
    methods: ["GET", "POST"]
  }
});

// When a client connects
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // Receive real-time donation update from frontend
  socket.on("send-donations", (data) => {
    console.log("📡 New live donation update:", data);

    // Broadcast to all connected clients
    io.emit("donations-update", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// ---------- SERVER LISTEN ----------
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
});
