import fcmToken from "../models/fcmToken.js";
import admin from "../config/firebaseAdmin.js";

export const saveFcmToken = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not logged in"
            });
        }
        const existingToken = await fcmToken.findOne({
            userId,
            token
        });
        if (!existingToken) {
            await fcmToken.create({
                userId,
                token
            });
        }
        res.status(200).json({
            success: true,
            message: "Token Saved"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const sendNotification = async (req, res) => {
    try {
        const { userId, title, body } = req.body;
        const tokens = await fcmToken.find({ userId });
        if (!tokens.length) {
            return res.status(404).json({
                success: false,
                message: "No FCM Tokens Found"
            });
        }
        const tokenList = tokens.map(
            (item) => item.token
        );
        const response =
            await admin.messaging().sendEachForMulticast({
                tokens: tokenList,
                notification: {
                    title,
                    body
                }
            });
        res.status(200).json({
            success: true,
            message: "Notification Sent",
            response
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};