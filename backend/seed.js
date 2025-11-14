import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define schemas inline for testing
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['donor', 'ngo'] },
  location: { lat: Number, lng: Number, text: String }
}, { timestamps: true });

const donationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodType: String,
  quantity: Number,
  expiresInHours: Number,
  location: { lat: Number, lng: Number, text: String },
  status: { type: String, enum: ['pending', 'accepted', 'onTheWay', 'picked', 'completed'], default: 'pending' },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  ngoLocation: { lat: Number, lng: Number }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Donation = mongoose.model('Donation', donationSchema);

const seedData = async () => {
  try {
    // Find or create test user
    let user = await User.findOne({ email: 'donor@test.com' });
    
    if (!user) {
      user = await User.create({
        name: 'Test Donor',
        email: 'donor@test.com',
        password: 'hashed_password',
        role: 'donor',
        location: { lat: 28.6139, lng: 77.2090, text: 'Delhi' }
      });
      console.log('Created test user:', user._id);
    }

    // Create test donations
    const donations = [
      {
        donorId: user._id,
        foodType: 'Rice and Vegetables',
        quantity: 20,
        expiresInHours: 2,
        location: { lat: 28.6139, lng: 77.2090, text: 'Delhi Center' }
      },
      {
        donorId: user._id,
        foodType: 'Bread and Butter',
        quantity: 15,
        expiresInHours: 3,
        location: { lat: 28.6200, lng: 77.2150, text: 'Delhi East' }
      },
      {
        donorId: user._id,
        foodType: 'Fruits - Mixed',
        quantity: 30,
        expiresInHours: 4,
        location: { lat: 28.6050, lng: 77.2000, text: 'Delhi West' }
      }
    ];

    // Clear existing donations and add new ones
    await Donation.deleteMany({ donorId: user._id });
    const created = await Donation.insertMany(donations);
    console.log('Created donations:', created.length);
    console.log('Test donations:', created.map(d => ({ id: d._id, type: d.foodType, qty: d.quantity })));

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

connectDB().then(() => seedData());
