import express from "express";
import {
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand,
  getBrandsByCategory,
} from "../controllers/brandController.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Create Brand
router.post(
  "/create",
  upload.single("image"),
  createBrand
);

// Get Brands By Category
router.get(
  "/category/:categoryId",
  getBrandsByCategory
);

// Get All Brands
router.get("/", getBrands);

// Update Brand
router.put(
  "/:id",
  upload.single("image"),
  updateBrand
);

// Delete Brand
router.delete("/:id", deleteBrand);

export default router;