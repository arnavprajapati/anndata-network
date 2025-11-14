import Donation from '../models/Donation.model.js';
import User from '../models/User.model.js';

// Create a new donation
export const createDonation = async (req, res) => {
  try {
    const { donorId, foodType, quantity, expiresInHours, location } = req.body;

    if (!donorId || !foodType || !quantity || !expiresInHours || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const donation = await Donation.create({
      donorId,
      foodType,
      quantity,
      expiresInHours,
      location,
    });

    return res.status(201).json({
      message: 'Donation created successfully',
      donation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all donations
export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().populate('donorId', 'name email location');
    return res.status(200).json(donations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get donation by ID
export const getDonationById = async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await Donation.findById(id).populate('donorId', 'name email location').populate('acceptedBy', 'name email location');
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    return res.status(200).json(donation);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update donation status
export const updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, acceptedBy } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const donation = await Donation.findByIdAndUpdate(
      id,
      { status, ...(acceptedBy && { acceptedBy }) },
      { new: true }
    ).populate('donorId', 'name email location').populate('acceptedBy', 'name email location');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    return res.status(200).json({
      message: 'Donation status updated',
      donation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Accept a donation
export const acceptDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { ngoId, ngoLocation } = req.body;

    if (!ngoId) {
      return res.status(400).json({ message: 'NGO ID is required' });
    }

    const donation = await Donation.findByIdAndUpdate(
      id,
      {
        status: 'accepted',
        acceptedBy: ngoId,
        ...(ngoLocation && { ngoLocation }),
      },
      { new: true }
    ).populate('donorId', 'name email location').populate('acceptedBy', 'name email location');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    return res.status(200).json({
      message: 'Donation accepted',
      donation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get live donations (for real-time map)
export const getLiveDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: { $in: ['pending', 'accepted'] } })
      .populate('donorId', 'name email location')
      .populate('acceptedBy', 'name email location');

    return res.status(200).json(donations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
