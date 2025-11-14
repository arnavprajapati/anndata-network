import Donation from "../models/Donation.model.js";

// --------------------------------------------------
// CREATE DONATION (Donor Only)
// --------------------------------------------------
export const createDonation = async (req, res) => {
  try {
    if (req.user.role !== "donor") {
      return res.status(403).json({ message: "Only donors can create donations" });
    }

    const { foodType, quantity, expiresInHours, location } = req.body;

    if (!foodType || !quantity || !expiresInHours || !location.lat || !location.lng) {
      return res.status(400).json({ message: "Missing required donation fields" });
    }

    const donation = await Donation.create({
      donorId: req.user._id,
      foodType,
      quantity,
      expiresInHours,
      location
    });

    return res.json({
      message: "Donation created successfully",
      donation
    });

  } catch (error) {
    console.error("Create Donation Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// GET PENDING DONATIONS (Public / NGO)
// --------------------------------------------------
export const getPendingDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: "pending" })
      .populate("donorId", "name location");

    return res.json(donations);

  } catch (error) {
    console.error("Get Pending Donations Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// GET DONOR'S DONATIONS (Donor Dashboard)
// --------------------------------------------------
export const getMyDonations = async (req, res) => {
  try {
    if (req.user.role !== "donor") {
      return res.status(403).json({ message: "Only donors can view their donations" });
    }

    const donations = await Donation.find({ donorId: req.user._id })
      .populate("acceptedBy", "name location");

    return res.json(donations);

  } catch (error) {
    console.error("Get My Donations Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// ACCEPT DONATION (NGO Only)
// --------------------------------------------------
export const acceptDonation = async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ message: "Only NGOs can accept donations" });
    }

    const donation = await Donation.findById(req.params.id);

    if (!donation) return res.status(404).json({ message: "Donation not found" });

    if (donation.status !== "pending") {
      return res.status(400).json({ message: "Donation already accepted" });
    }

    donation.status = "accepted";
    donation.acceptedBy = req.user._id;

    await donation.save();

    return res.json({
      message: "Donation accepted",
      donation
    });

  } catch (error) {
    console.error("Accept Donation Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// UPDATE NGO LIVE LOCATION (Tracking)
// --------------------------------------------------
export const updateNgoLocation = async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ message: "Only NGOs can update live location" });
    }

    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Missing NGO coordinates" });
    }

    const donation = await Donation.findById(req.params.id);

    if (!donation) return res.status(404).json({ message: "Donation not found" });

    // Only the NGO who accepted can update tracking
    if (donation.acceptedBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this donation" });
    }

    donation.ngoLocation = { lat, lng };
    donation.status = "onTheWay";

    await donation.save();

    return res.json({
      message: "NGO live location updated",
      donation
    });

  } catch (error) {
    console.error("Update NGO Location Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
