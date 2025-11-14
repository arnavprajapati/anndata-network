<<<<<<< HEAD
import mongoose from 'mongoose';
=======
import mongoose from "mongoose";
>>>>>>> 76559eb6b59f57ce453b630264cb0c4ba8cf6bc3

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
<<<<<<< HEAD
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
=======

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
>>>>>>> 76559eb6b59f57ce453b630264cb0c4ba8cf6bc3
    process.exit(1);
  }
};

export default connectDB;
