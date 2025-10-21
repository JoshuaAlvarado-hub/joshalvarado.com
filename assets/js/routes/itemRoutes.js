// routes/itemRoutes.js
import express from "express";
import { db } from "../firebase.js";

const router = express.Router();

// Use a single "items" collection for all users
const ITEMS_COLLECTION = "items";

// GET all items
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection(ITEMS_COLLECTION).get();
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ message: "Failed to fetch items" });
  }
});

// POST a new item
router.post("/", async (req, res) => {
  try {
    const { title, details, gateCode, doorCode } = req.body;

    const item = {
      title: title || "",
      details: details || "",
      gateCode: gateCode || "",
      doorCode: doorCode || "",
    };

    const docRef = await db.collection(ITEMS_COLLECTION).add(item);
    res.json({ id: docRef.id, ...item });
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({ message: "Failed to add item" });
  }
});

// PUT /:id — update item
router.put("/:id", async (req, res) => {
  try {
    const { title, details, gateCode, doorCode } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (details !== undefined) updates.details = details;
    if (gateCode !== undefined) updates.gateCode = gateCode;
    if (doorCode !== undefined) updates.doorCode = doorCode;

    await db.collection(ITEMS_COLLECTION).doc(req.params.id).update(updates);
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ message: "Failed to update item" });
  }
});

// DELETE /:id
router.delete("/:id", async (req, res) => {
  try {
    await db.collection(ITEMS_COLLECTION).doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ message: "Failed to delete item" });
  }
});

export default router;