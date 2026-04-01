import express from "express";
import cors from "cors";
import authRoutes from "./authRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", authRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "OK", time: new Date() }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🔐 Backend: http://localhost:${PORT}/api/health`);
});

app.use('/api', express.static('../client/build')); // frontend статика