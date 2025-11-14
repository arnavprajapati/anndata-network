<<<<<<< HEAD
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
=======
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.route.js";
// import donationRoutes from "./routes/donation.routes.js";
import connectDB from "./config/db.js";

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    'http://localhost:5173', 
    'http://127.0.0.1:5173', 
    'http://www.localhost:5173'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); 
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true, 
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
// app.use("/api/donations", donationRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
>>>>>>> 76559eb6b59f57ce453b630264cb0c4ba8cf6bc3
