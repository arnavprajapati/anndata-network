import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  createDonation,
  getPendingDonations,
  getMyDonations,
  acceptDonation,
  updateNgoLocation
} from "../controllers/donation.controller.js";

const router = express.Router();


router.post("/create", authMiddleware, createDonation);

router.get("/pending", getPendingDonations);

router.get("/my", authMiddleware, getMyDonations);

router.post("/:id/accept", authMiddleware, acceptDonation);

router.post("/:id/update-location", authMiddleware, updateNgoLocation);

export default router;
