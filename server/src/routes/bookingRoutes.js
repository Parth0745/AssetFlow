import { Router } from "express";
import { cancelBooking, createBooking, listBookings, updateBooking } from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, listBookings);
router.post("/", protect, createBooking);
router.put("/:id", protect, updateBooking);
router.post("/:id/cancel", protect, cancelBooking);

export default router;
