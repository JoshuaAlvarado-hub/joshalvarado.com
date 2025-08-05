const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// make these database items later
let profiles = {};
let todos = [];

// Create/update a new user profile
app.post('/api/profile', (req, res) => {
    const { userId, name, email } = req.body;
    if (!userId || !name || !email) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    profiles[userId] = { name, email };
    res.json({ success: true, profile: profiles[userId] });
});

// Get user profile by username
app.get('/api/profile/:userId', (req, res) => {
    const profile = profiles[req.params.userId];
    if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
});

// Get all todos
app.get('/api/todos', (req, res) => {
    res.json(todos);
});

// Add a new todo
app.post('/api/todos', (req, res) => {
    const { text, completed } = req.body;
    todos.push({ text, completed });
    res.json({ success: true });
});

// Update a todo's status
app.put('/api/todos/:idx', (req, res) => {
    const idx = parseInt(req.params.idx, 10);
    if (todos[idx]) {
        if (typeof req.body.completed !== 'undefined') {
            todos[idx].completed = req.body.completed;
        }
        if (typeof req.body.text !== 'undefined') {
            todos[idx].text = req.body.text;
        }
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Todo not found' });
    }
});

// Delete a todo
app.delete('/api/todos/:idx', (req, res) => {
    const idx = parseInt(req.params.idx, 10);
    if (todos[idx]) {
        todos.splice(idx, 1);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Todo not found' });
    }
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));