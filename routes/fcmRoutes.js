import express from "express";
import { saveFcmToken, sendNotification,} from "../controllers/fcmController.js";
  
const router = express.Router();
router.post(
  "/save-token",
  saveFcmToken
);
router.post(
  "/send-notification",
  sendNotification
);

export default router;