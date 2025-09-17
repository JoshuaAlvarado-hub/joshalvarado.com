import { admin } from "../firebase.js";

export async function ensureAuthenticated(req, res, next) {
  const sessionCookie = req.cookies?.session || "";
  try {
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    req.user = decoded; // contains uid, email, name, etc.
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}