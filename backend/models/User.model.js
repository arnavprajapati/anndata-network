import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['donor', 'ngo'],
    required: true
  },

  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    text: { type: String, default: '' }
  }

}, 
{ timestamps: true }
);

export default mongoose.model('User', userSchema);
