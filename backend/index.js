import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.route.js";
import donationRoutes from "./routes/donation.routes.js";
import connectDB from "./config/db.js";
import authMiddleware from "./middleware/auth.middleware.js";
import { getCurrentUser } from "./controllers/auth.controller.js";

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

app.use((req, res, next) => {
    const allowedOrigins = [
        'https://anndata-network.vercel.app',
        'http://localhost:5173',
        process.env.FRONTEND_URL
    ].filter(Boolean);

    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    
    next();
});

app.use(cors({
    origin: [
        'https://anndata-network.vercel.app',
        'http://localhost:5173',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cookie'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Origin:', req.get('origin'));
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.get("/api/auth/me", authMiddleware, getCurrentUser);

app.get("/", (req, res) => {
    res.json({ 
        message: "API is running...",
        timestamp: new Date().toISOString()
    });
});

app.get("/api/test-cors", (req, res) => {
    res.json({ 
        message: "CORS is working!",
        origin: req.get('origin')
    });
});

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: err.message || 'Internal Server Error' 
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Frontend URL:', process.env.FRONTEND_URL);
});