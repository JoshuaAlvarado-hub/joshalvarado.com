import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

// Initialize Firebase Admin with service account JSON from Render env
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}
const db = admin.firestore();

const app = express();
app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://www.joshalvarado.com', 'https://joshalvarado.com']
    : 'http://localhost:4000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    domain: process.env.NODE_ENV === 'production' ? '.joshalvarado.com' : undefined,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport Google strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://api.joshalvarado.com/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const userRef = db.collection("profiles").doc(profile.id);
    const userData = {
      id: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value
    };
    await userRef.set(userData, { merge: true }); // upsert user
    return done(null, userData);
  } catch (err) {
    return done(err, null);
  }
}));

// Serialize/deserialize users with Firestore
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const doc = await db.collection("profiles").doc(id).get();
    if (!doc.exists) return done(new Error("User not found"), null);
    done(null, doc.data());
  } catch (err) {
    done(err, null);
  }
});

// Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('https://joshalvarado.com/todo/');
  }
);

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('https://joshalvarado.com/todo/');
  });
});

// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Todo routes (Firestore-backed)
app.get('/api/todos', ensureAuthenticated, async (req, res) => {
  const snapshot = await db.collection("profiles").doc(req.user.id).collection("todos").get();
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

app.post('/api/todos', ensureAuthenticated, async (req, res) => {
  const { text, completed } = req.body;
  await db.collection("profiles").doc(req.user.id).collection("todos").add({ text, completed });
  res.json({ success: true });
});

app.put('/api/todos/:id', ensureAuthenticated, async (req, res) => {
  await db.collection("profiles").doc(req.user.id).collection("todos").doc(req.params.id).update(req.body);
  res.json({ success: true });
});

app.delete('/api/todos/:id', ensureAuthenticated, async (req, res) => {
  await db.collection("profiles").doc(req.user.id).collection("todos").doc(req.params.id).delete();
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
