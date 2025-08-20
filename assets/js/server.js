const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

const app = express();

app.use(cors({
    origin: 'https://joshalvarado.com',
    credentials: true
}));
app.use(express.json());

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: 'none',
        secure: true
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// In-memory storage (replace with DB in production)
let profiles = {};
let todos = {};

// Passport config
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://joshalvarado.com/auth/google/callback'
}, function(accessToken, refreshToken, profile, done) {
    profiles[profile.id] = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value
    };
    if (!todos[profile.id]) todos[profile.id] = [];
    return done(null, profiles[profile.id]);
}));

// Redirect after login
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('https://joshalvarado.com/todo/');
    }
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    const user = profiles[id];
    if (user) {
        done(null, user);
    } else {
        done(new Error('User not found'));
    }
});

// Auth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/user', (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.json({ user: null });
    }
});

app.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
}

// Todo routes (per user)
app.get('/api/todos', ensureAuthenticated, (req, res) => {
    res.json(todos[req.user.id] || []);
});

app.post('/api/todos', ensureAuthenticated, (req, res) => {
    const { text, completed } = req.body;
    if (!todos[req.user.id]) todos[req.user.id] = [];
    todos[req.user.id].push({ text, completed });
    res.json({ success: true });
});

app.put('/api/todos/:idx', ensureAuthenticated, (req, res) => {
    const idx = parseInt(req.params.idx, 10);
    const userTodos = todos[req.user.id] || [];
    if (userTodos[idx]) {
        if (typeof req.body.completed !== 'undefined') {
            userTodos[idx].completed = req.body.completed;
        }
        if (typeof req.body.text !== 'undefined') {
            userTodos[idx].text = req.body.text;
        }
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Todo not found' });
    }
});

app.delete('/api/todos/:idx', ensureAuthenticated, (req, res) => {
    const idx = parseInt(req.params.idx, 10);
    const userTodos = todos[req.user.id] || [];
    if (userTodos[idx]) {
        userTodos.splice(idx, 1);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Todo not found' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});