import express from "express";

import {
  createProduct,
  getProducts,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/create",
  upload.array("images", 10),
  createProduct
);

router.get("/all", getAllProducts);
router.get("/", getProducts);
router.get("/:id", getSingleProduct);

router.put(
  "/:id",
  upload.array("images", 10),
  updateProduct
);

router.delete("/:id", deleteProduct);

export default router;