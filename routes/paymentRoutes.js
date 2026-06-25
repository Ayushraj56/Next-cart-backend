import express from "express";

import {
    createPaymentLink,
    razorpayWebhook,
} from "../controllers/paymentController.js";

const router = express.Router();

// CREATE PAYMENT LINK
router.post(
    "/create-payment-link",
    createPaymentLink
);

// WEBHOOK
router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    razorpayWebhook
);

export default router;