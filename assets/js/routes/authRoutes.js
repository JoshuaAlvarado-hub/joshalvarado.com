import express from "express";
import { admin, db } from "../firebase.js";

const router = express.Router();

// Login: Exchange ID token for session cookie
router.post("/sessionLogin", async (req, res) => {
  const { idToken } = req.body;
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  if (!idToken) {
    return res.status(400).json({ message: "Missing ID token" });
  }

  try {
    // Verify the ID token
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);

    // Create a session cookie
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    // Set the cookie
    res.cookie("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain: process.env.NODE_ENV === "production" ? ".joshalvarado.com" : undefined,
    });

    // Save/update user profile in Firestore
    const userRef = db.collection("profiles").doc(decodedIdToken.uid);
    await userRef.set({
      id: decodedIdToken.uid,
      name: decodedIdToken.name || "",
      email: decodedIdToken.email || "",
    }, { merge: true });

    res.json({ success: true });
  } catch (err) {
    console.error("SessionLogin error:", err.code, err.message, err.stack);
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Logout: Clear session cookie
router.post("/logout", (req, res) => {
  res.clearCookie("session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: process.env.NODE_ENV === "production" ? ".joshalvarado.com" : undefined,
  });
  res.json({ success: true });
});

// Get current user from session cookie
router.get("/user", async (req, res) => {
  try {
    const sessionCookie = req.cookies.session || "";
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
});

export default router;