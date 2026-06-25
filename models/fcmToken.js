import mongoose from "mongoose";

const fcmTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    token: {
        type: String,
        required: true
    }
});

export default mongoose.model("fcmToken", fcmTokenSchema);