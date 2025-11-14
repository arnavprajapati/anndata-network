import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({

  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  foodType: {
    type: String,
    required: true
  },

  quantity: {
    type: Number,
    required: true
  },

  expiresInHours: {
    type: Number,
    required: true
  },

  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    text: { type: String, default: '' }
  },

  status: {
    type: String,
    enum: [
      'pending',    
      'accepted',   
      'onTheWay',   
      'picked',     
      'completed'   
    ],
    default: 'pending'
  },

  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  ngoLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  }

},
{ timestamps: true }
);

<<<<<<< HEAD
export default mongoose.model('Donation', donationSchema);
=======

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
>>>>>>> 76559eb6b59f57ce453b630264cb0c4ba8cf6bc3
