import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
  me,
  getUsers,
  deleteUser,
} from "../controllers/authController.js";

const router = express.Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post("/signup",      signup);
router.post("/login",       login);
router.post("/logout",      logout);
router.get("/me",           getMe);

// ─── Dashboard users ──────────────────────────────────────────────────────────
router.get("/users",        getUsers);      
router.delete("/users/:id", deleteUser);    

export default router;