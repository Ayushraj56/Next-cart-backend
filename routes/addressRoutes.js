import express from "express";
import {
  createAddress,
  getAddresses,
  deleteAddress,
  updateAddress,
} from "../controllers/addressController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createAddress);
router.get("/", getAddresses);
router.delete("/:id", deleteAddress);
router.put("/:id", updateAddress);
export default router;