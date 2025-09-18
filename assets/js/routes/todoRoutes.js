import express from "express";
import { db } from "../firebase.js";
import { ensureAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.use(ensureAuthenticated);

// GET
router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection("profiles")
      .doc(req.user.uid)
      .collection("todos")
      .get();

    const todos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(todos);
  } catch (err) {
    console.error("Error fetching todos:", err);
    res.status(500).json({ message: "Failed to fetch todos" });
  }
});

// POST
router.post("/", async (req, res) => {
  try {
    const { text, completed } = req.body;
    await db
      .collection("profiles")
      .doc(req.user.uid)
      .collection("todos")
      .add({ text, completed });

    res.json({ success: true });
  } catch (err) {
    console.error("Error adding todo:", err);
    res.status(500).json({ message: "Failed to add todo" });
  }
});

// PUT
router.put("/:id", async (req, res) => {
  try {
    await db
      .collection("profiles")
      .doc(req.user.uid)
      .collection("todos")
      .doc(req.params.id)
      .update(req.body);

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).json({ message: "Failed to update todo" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await db
      .collection("profiles")
      .doc(req.user.uid)
      .collection("todos")
      .doc(req.params.id)
      .delete();

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).json({ message: "Failed to delete todo" });
  }
});

export default router;
