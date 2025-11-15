import Donation from "../models/Donation.model.js";
import User from "../models/User.model.js";

const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
};



export const createDonation = async (req, res) => {
    try {
        if (req.user.role !== "donor") {
            return res.status(403).json({ message: "Only donors can create donations" });
        }

        const { foodType, quantity, expiresInHours, location } = req.body;

        // Enhanced validation
        if (!foodType || !quantity || !expiresInHours || !location?.lat || !location?.lng) {
            return res.status(400).json({ 
                message: "Missing required fields",
                required: ["foodType", "quantity", "expiresInHours", "location (lat, lng)"]
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({ message: "Quantity must be greater than 0" });
        }

        if (expiresInHours <= 0 || expiresInHours > 72) {
            return res.status(400).json({ message: "Expiry hours must be between 1 and 72" });
        }

        const donation = await Donation.create({
            donorId: req.user._id,
            foodType: foodType.trim(),
            quantity,
            expiresInHours,
            location: {
                lat: location.lat,
                lng: location.lng,
                text: location.text || ''
            }
        });

        const populatedDonation = await Donation.findById(donation._id)
            .populate("donorId", "name email location");

        return res.status(201).json({
            message: "Donation created successfully",
            donation: populatedDonation
        });

    } catch (error) {
        console.error("Create Donation Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



export const getPendingDonations = async (req, res) => {
    try {
        const { radius, lat, lng } = req.query;

        let donations = await Donation.find({ status: "pending" })
            .populate("donorId", "name email location")
            .sort({ createdAt: -1 });

        if (lat && lng && radius) {
            const ngoLat = parseFloat(lat);
            const ngoLng = parseFloat(lng);
            const maxRadius = parseFloat(radius);

            donations = donations.filter(donation => {
                if (!donation.location?.lat || !donation.location?.lng) return false;
                
                const distance = calculateDistance(
                    ngoLat, ngoLng,
                    donation.location.lat, donation.location.lng
                );
                
                donation._doc.distance = Math.round(distance * 10) / 10; // Round to 1 decimal
                return distance <= maxRadius;
            });

            donations.sort((a, b) => (a._doc.distance || 0) - (b._doc.distance || 0));
        }

        return res.json({
            count: donations.length,
            donations
        });

    } catch (error) {
        console.error("Get Pending Donations Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};



export const getMyDonations = async (req, res) => {
    try {
        if (req.user.role !== "donor") {
            return res.status(403).json({ message: "Only donors can view their donations" });
        }

        const { status } = req.query;
        
        const filter = { donorId: req.user._id };
        if (status) {
            filter.status = status;
        }

        const donations = await Donation.find(filter)
            .populate("acceptedBy", "name email location")
            .sort({ createdAt: -1 });

        return res.json({
            count: donations.length,
            donations
        });

    } catch (error) {
        console.error("Get My Donations Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};



export const getMyAcceptedDonations = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can view accepted donations" });
        }

        const { status } = req.query;
        
        const filter = { acceptedBy: req.user._id };
        if (status) {
            filter.status = status;
        }

        const donations = await Donation.find(filter)
            .populate("donorId", "name email location")
            .sort({ createdAt: -1 });

        return res.json({
            count: donations.length,
            donations
        });

    } catch (error) {
        console.error("Get My Accepted Donations Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};



export const acceptDonation = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can accept donations" });
        }

        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        if (donation.status !== "pending") {
            return res.status(400).json({ 
                message: "Donation already accepted or completed",
                currentStatus: donation.status
            });
        }

        const updatedDonation = await Donation.findByIdAndUpdate(
            req.params.id,
            {
                status: "accepted",
                acceptedBy: req.user._id,
            },
            { new: true, runValidators: true }
        ).populate("donorId", "name email location");

        if (!updatedDonation) {
            return res.status(500).json({ message: "Failed to update donation" });
        }

        return res.json({
            message: "Donation accepted successfully",
            donation: updatedDonation
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            console.error("Accept Donation Validation Error:", error.message);
            return res.status(400).json({ message: `Validation failed: ${error.message}` });
        }
        console.error("Accept Donation Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// UPDATE NGO LIVE LOCATION (Real-time Tracking)

export const updateNgoLocation = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can update live location" });
        }

        const { lat, lng } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ message: "Latitude and longitude required" });
        }

        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        // Only the NGO who accepted can update tracking
        if (donation.acceptedBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this donation" });
        }

        if (donation.status === "pending") {
            return res.status(400).json({ message: "Accept the donation first" });
        }

        if (donation.status === "completed" || donation.status === "picked") {
            return res.status(400).json({ message: "Cannot update location for completed donations" });
        }

        const updatedDonation = await Donation.findByIdAndUpdate(
            req.params.id,
            {
                ngoLocation: { lat, lng },
                status: "onTheWay"
            },
            { new: true }
        ).populate("donorId", "name email location");

        // Calculate distance to donor
        let distance = null;
        if (updatedDonation.location?.lat && updatedDonation.location?.lng) {
            distance = calculateDistance(
                lat, lng,
                updatedDonation.location.lat,
                updatedDonation.location.lng
            );
        }

        return res.json({
            message: "NGO location updated",
            donation: updatedDonation,
            distanceToDonor: distance ? Math.round(distance * 10) / 10 : null
        });

    } catch (error) {
        console.error("Update NGO Location Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// MARK DONATION AS PICKED (NGO Only)

export const markDonationPicked = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can mark donations as picked" });
        }

        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        if (donation.acceptedBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this donation" });
        }

        if (donation.status === "pending") {
            return res.status(400).json({ message: "Accept the donation first" });
        }

        if (donation.status === "picked" || donation.status === "completed") {
            return res.status(400).json({ message: "Donation already picked or completed" });
        }

        const updatedDonation = await Donation.findByIdAndUpdate(
            req.params.id,
            {
                status: "picked",
                ngoLocation: null,
            },
            { new: true }
        ).populate("donorId", "name email location");

        return res.json({
            message: "Donation marked as picked",
            donation: updatedDonation
        });

    } catch (error) {
        console.error("Mark Donation Picked Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// MARK DONATION AS COMPLETED (NGO Only)

export const markDonationCompleted = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Only NGOs can mark donations as completed" });
        }

        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        if (donation.acceptedBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this donation" });
        }

        if (donation.status !== "picked") {
            return res.status(400).json({ message: "Donation must be picked first" });
        }

        const updatedDonation = await Donation.findByIdAndUpdate(
            req.params.id,
            {
                status: "completed",
            },
            { new: true }
        ).populate("donorId", "name email location");

        return res.json({
            message: "Donation marked as completed",
            donation: updatedDonation
        });

    } catch (error) {
        console.error("Mark Donation Completed Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// GET SINGLE DONATION DETAILS (For Tracking)

export const getDonationDetails = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate("donorId", "name email location")
            .populate("acceptedBy", "name email location");

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        // Check authorization - only donor or accepted NGO can view
        const isAuthorized = 
            req.user._id.toString() === donation.donorId._id.toString() ||
            (donation.acceptedBy && req.user._id.toString() === donation.acceptedBy._id.toString());

        if (!isAuthorized) {
            return res.status(403).json({ message: "Not authorized to view this donation" });
        }

        // Calculate distance if NGO is on the way
        let distance = null;
        if (donation.ngoLocation?.lat && donation.location?.lat) {
            distance = calculateDistance(
                donation.ngoLocation.lat,
                donation.ngoLocation.lng,
                donation.location.lat,
                donation.location.lng
            );
        }

        return res.json({
            donation,
            distanceToDonor: distance ? Math.round(distance * 10) / 10 : null
        });

    } catch (error) {
        console.error("Get Donation Details Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// CANCEL DONATION (Donor Only - Only if pending)

export const cancelDonation = async (req, res) => {
    try {
        if (req.user.role !== "donor") {
            return res.status(403).json({ message: "Only donors can cancel donations" });
        }

        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        if (donation.donorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to cancel this donation" });
        }

        if (donation.status !== "pending") {
            return res.status(400).json({ 
                message: "Cannot cancel donation once accepted",
                currentStatus: donation.status
            });
        }

        await Donation.findByIdAndDelete(req.params.id);

        return res.json({
            message: "Donation cancelled successfully"
        });

    } catch (error) {
        console.error("Cancel Donation Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};