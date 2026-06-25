import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        addressId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            required: true,
        },

        products: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                },
                quantity: Number,
                price: Number,
            },
        ],


        shippingCharge: {
            type: Number,
            default: 0,
        },

        subtotal: {
            type: Number,
            required: true,
        },

        total: {
            type: Number,
            required: true,
        },

        paymentMethod: {
            type: String,
            enum: ["COD", "RAZORPAY"],
            default: "COD",
        },

        paymentId: String,
        razorpayOrderId: String,

        status: {
            type: String,
            enum: [
                "Pending",
                "Accepted",
                "Rejected",
                "Shipped",
                "Delivered",
            ],
            default: "Pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model(
    "Order",
    orderSchema
);