import express from 'express';
import {
  createDonation,
  getAllDonations,
  getDonationById,
  updateDonationStatus,
  acceptDonation,
  getLiveDonations,
} from '../controllers/donation.controller.js';

const router = express.Router();

router.post('/', createDonation);
router.get('/', getAllDonations);
router.get('/live', getLiveDonations);
router.get('/:id', getDonationById);
router.patch('/:id', updateDonationStatus);
router.post('/:id/accept', acceptDonation);

export default router;
