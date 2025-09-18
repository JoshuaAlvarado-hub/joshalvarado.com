import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

app.use(cors({
  origin: process.env.NODE_ENV === "production"
  ? [
      "https://joshalvarado.com",
      "https://www.joshalvarado.com",
      "http://joshalvarado.com",
      "http://www.joshalvarado.com"
    ]
  : "http://localhost:4000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", authRoutes);
app.use("/api/todos", todoRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
