import express from "express";
import { admin, db } from "../firebase.js";

const router = express.Router();

/**
 * Login endpoint — exchange ID token for session cookie
 */
router.post("/sessionLogin", async (req, res) => {
  const { idToken } = req.body;
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);

    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    res.cookie("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain: process.env.NODE_ENV === "production" ? ".joshalvarado.com" : undefined
    });

    // Save/update user profile in Firestore
    const userRef = db.collection("profiles").doc(decodedIdToken.uid);
    await userRef.set({
      id: decodedIdToken.uid,
      name: decodedIdToken.name || "",
      email: decodedIdToken.email,
    }, { merge: true });

    res.json({ success: true });
  } catch (err) {
    console.error("SessionLogin error:", err);
    res.status(401).send("Unauthorized");
  }
});

/**
 * Logout
 */
router.post("/logout", (req, res) => {
  res.clearCookie("session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: process.env.NODE_ENV === "production" ? ".joshalvarado.com" : undefined
  });
  res.json({ success: true });
});

/**
 * Current user
 */
router.get("/user", async (req, res) => {
  try {
    const sessionCookie = req.cookies.session || "";
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    res.json({ user: decoded });
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
});

export default router;