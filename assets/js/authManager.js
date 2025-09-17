import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Firebase config injected by Jekyll in default.html
const firebaseConfig = window.firebaseConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Detect backend API
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3001/api"
    : "https://joshalvarado.com/api";

// DOM elements
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");

// Update buttons based on server session
export async function updateAuthButtons() {
  try {
    const res = await fetch(`${API_BASE}/user`, { credentials: "include" });
    const data = await res.json();

    if (data.user) {
      loginBtn?.style.setProperty("display", "none");
      logoutBtn?.style.setProperty("display", "inline-block");
    } else {
      loginBtn?.style.setProperty("display", "inline-block");
      logoutBtn?.style.setProperty("display", "none");
    }
  } catch (err) {
    console.error("User check error:", err);
  }
}

// Login
export async function login() {
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    await fetch(`${API_BASE}/sessionLogin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      credentials: "include",
    });

    await updateAuthButtons();
  } catch (err) {
    console.error("Login error:", err);
    alert("Sign-in failed");
  }
}

// Logout
export async function logout() {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: "POST",
      credentials: "include",
    });

    await signOut(auth);
    await updateAuthButtons();
  } catch (err) {
    console.error("Logout error:", err);
  }
}

// Attach event listeners on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  loginBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    login();
  });

  logoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  updateAuthButtons(); // initialize buttons
});
