dotenv.config();


import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.route.js";
import donationRoutes from "./routes/donation.routes.js";

const app = express();

connectDB();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/donations", donationRoutes);

app.get("/", (req, res) => {
  res.send("BloomNet Backend (ES Modules) is Running...");
});

const PORT = process.env.PORT || 5000;

// zcheck if connection is successful with mongoose
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
