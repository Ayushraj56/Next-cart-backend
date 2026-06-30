import crypto from "crypto";
import mongoose from "mongoose";
import razorpay from "../config/razorpay.js";
import User from "../models/user.js";
import Address from "../models/address.js";
import Cart from "../models/cart.js";
import Order from "../models/order.js";

// CREATE PAYMENT LINK
export const createPaymentLink = async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        const address = await Address.findOne({ userId });
        const cartItems = await Cart.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productId",
                },
            },
            {
                $unwind: "$productId",
            },
        ]);

        if (!cartItems.length) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty",
            });
        }

        let subtotal = 0;

        cartItems.forEach((item) => {
            subtotal += item.productId.price * item.quantity;
        });

        const shippingCharge = 50;
        const total = subtotal + shippingCharge;

        const paymentLink = await razorpay.paymentLink.create({
            amount: total * 100,
            currency: "INR",
            description: "GoCart Order Payment",
            callback_url: `${process.env.FRONTEND_URL}/payment-success`,
            callback_method: "get",
            customer: {
                name: user.name,
                email: user.email,
                contact: user.phone || "",
            },
            notify: {
                sms: true,
                email: true,
            },
            reminder_enable: true,
            notes: {
                userId: user._id.toString(),
                addressId: address._id.toString(),
                subtotal: subtotal.toString(),
                shippingCharge: shippingCharge.toString(),
                total: total.toString(),
            },
        });

        res.json({
            success: true,
            payment_link: paymentLink.short_url,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// WEBHOOK
export const razorpayWebhook = async (req, res) => {
    try {

        const razorpaySignature = req.headers["x-razorpay-signature"];
        const webhookSecret = process.env.WEBHOOK_SECRET;
        const generatedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(req.body)
            .digest("hex");

        if (generatedSignature !== razorpaySignature) {
            return res.status(400).json({
                success: false,
                message: "Invalid Signature",
            });
        }
        const data = JSON.parse(req.body.toString());
        console.log("Webhook Event:", data.event);

        // PAYMENT LINK PAID
        if (data.event === "payment_link.paid") {

            const payment = data.payload.payment.entity;
            const paymentLink = data.payload.payment_link.entity;
            const userId = paymentLink.notes.userId;
            const addressId = paymentLink.notes.addressId;
            const subtotal = Number(paymentLink.notes.subtotal);
            const shippingCharge = Number(paymentLink.notes.shippingCharge);
            const total = Number(paymentLink.notes.total);

            const products = await Cart.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                    },
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "productId",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                {
                    $unwind: "$product",
                },
                {
                    $project: {
                        _id: 0,
                        productId: "$product._id",
                        quantity: 1,
                        price: "$product.price",
                    },
                },
            ]);

            await Order.create({
                orderId: "ORD" + Date.now(),
                userId,
                addressId,
                products,
                subtotal,
                shippingCharge,
                total,
                paymentMethod: "RAZORPAY",
                paymentId: payment.id,
                paymentStatus: "Paid",
                status: "Accepted",
            });

            await Cart.deleteMany({ userId });
            console.log("Order Created");
        }

        // PAYMENT FAILED
        if (data.event === "payment.failed") {
            console.log("Payment Failed");
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};