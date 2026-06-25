import express from "express";
import {
  addToCart,
  getCart,
  deleteCartItem,
  increaseQuantity,
  decreaseQuantity,
} from "../controllers/cartController.js";

const router = express.Router();

router.post(
  "/add",
  addToCart
);

router.get(
  "/",
  getCart
);

router.delete(
  "/:id",
  deleteCartItem
);

router.put(
  "/increase/:id",
  increaseQuantity
);

router.put(
  "/decrease/:id",
  decreaseQuantity
);

export default router;