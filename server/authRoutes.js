import express from "express";
import { supabase } from "./db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data.user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ session: data.session });
});

router.get("/test", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});
export default router;