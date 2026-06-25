import Order from "../models/order.js";
import Cart from "../models/cart.js";
import mongoose from "mongoose";

export const createOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { addressId } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Please login" });
        }

        if (!addressId) {
            return res.status(400).json({ success: false, message: "Address is required" });
        }

        const cartItems = await Cart.find({ userId }).populate("productId");

        if (!cartItems.length) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        let subtotal = 0;
        const products = cartItems.map((item) => {
            subtotal += item.productId.price * item.quantity;
            return {
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.productId.price,
            };
        });

        const shippingCharge = 50;
        const order = await Order.create({
            orderId: "ORD" + Date.now(),
            userId,
            addressId,
            products,
            shippingCharge,
            subtotal,
            total: subtotal + shippingCharge,
            status: "Pending",
        });

        await Cart.deleteMany({ userId });

        res.status(201).json({ success: true, message: "Order placed successfully", order });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.session.userId);

        const orders = await Order.aggregate([
            { $match: { userId } },

            // Join each product in the products array
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },

            // Merge product details back into products array
            {
                $addFields: {
                    products: {
                        $map: {
                            input: "$products",
                            as: "item",
                            in: {
                                quantity: "$$item.quantity",
                                price: "$$item.price",
                                productId: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$productDetails",
                                                as: "pd",
                                                cond: { $eq: ["$$pd._id", "$$item.productId"] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
            },

            // Join address
            {
                $lookup: {
                    from: "addresses",
                    localField: "addressId",
                    foreignField: "_id",
                    as: "addressId",
                },
            },
            { $unwind: { path: "$addressId", preserveNullAndEmptyArrays: true } },

            // Cleanup
            { $unset: "productDetails" },
            { $sort: { createdAt: -1 } },
        ]);

        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.aggregate([
            // Join user
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId",
                },
            },
            { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },

            // Join address
            {
                $lookup: {
                    from: "addresses",
                    localField: "addressId",
                    foreignField: "_id",
                    as: "addressId",
                },
            },
            { $unwind: { path: "$addressId", preserveNullAndEmptyArrays: true } },

            // Join each product in the products array
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },

            // Merge product details back into products array
            {
                $addFields: {
                    products: {
                        $map: {
                            input: "$products",
                            as: "item",
                            in: {
                                quantity: "$$item.quantity",
                                price: "$$item.price",
                                productId: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$productDetails",
                                                as: "pd",
                                                cond: { $eq: ["$$pd._id", "$$item.productId"] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
            },

            // Cleanup temp field
            { $unset: "productDetails" },
            { $sort: { createdAt: -1 } },
        ]);

        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};