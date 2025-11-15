import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
    createDonation,
    getPendingDonations,
    getMyDonations,
    getMyAcceptedDonations,
    acceptDonation,
    updateNgoLocation,
    markDonationPicked,
    markDonationCompleted,
    getDonationDetails,
    cancelDonation
} from "../controllers/donation.controller.js";

const router = express.Router();

router.post("/create", authMiddleware, createDonation);

router.get("/my", authMiddleware, getMyDonations);

router.delete("/:id/cancel", authMiddleware, cancelDonation);


router.get("/pending", getPendingDonations);

router.get("/my-accepted", authMiddleware, getMyAcceptedDonations);

router.post("/:id/accept", authMiddleware, acceptDonation);

router.post("/:id/update-location", authMiddleware, updateNgoLocation);

router.post("/:id/mark-picked", authMiddleware, markDonationPicked);

router.post("/:id/mark-completed", authMiddleware, markDonationCompleted);

router.get("/:id", authMiddleware, getDonationDetails);

export default router;