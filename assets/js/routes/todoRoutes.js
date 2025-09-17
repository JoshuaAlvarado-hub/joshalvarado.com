import express from 'express';
import { db } from '../firebase.js';
import { ensureAuthenticated } from './auth.js';

const router = express.Router();

router.use(ensureAuthenticated);

// GET /api/todos
router.get('/', async (req, res) => {
  const snapshot = await db.collection('profiles').doc(req.user.uid).collection('todos').get();
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

// POST /api/todos
router.post('/', async (req, res) => {
  const { text, completed } = req.body;
  await db.collection('profiles').doc(req.user.uid).collection('todos').add({ text, completed });
  res.json({ success: true });
});

// PUT /api/todos/:id
router.put('/:id', async (req, res) => {
  await db.collection('profiles').doc(req.user.uid).collection('todos').doc(req.params.id).update(req.body);
  res.json({ success: true });
});

// DELETE /api/todos/:id
router.delete('/:id', async (req, res) => {
  await db.collection('profiles').doc(req.user.uid).collection('todos').doc(req.params.id).delete();
  res.json({ success: true });
});

export default router;
