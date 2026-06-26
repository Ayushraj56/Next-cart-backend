import express from "express";
import session from "express-session";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import fcmRoutes from "./routes/fcmRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import MongoStore from 'connect-mongo';
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  })
}));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);

app.use(
  session({
    secret: "ayush56",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "public/uploads"))
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/product", productRoutes);
app.use("/api/fcm", fcmRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.listen(3200, async () => {
  await connectDB();

  console.log(
    "Server Running On Port 3200"
  );
});