import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { closeMobileMenu } from "./manager.js";

// Firebase config injected via Jekyll in default.html
const firebaseConfig = window.firebaseConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Backend API base
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3001/api"
    : "https://api.joshalvarado.com/api";

// DOM elements
const desktopAuthBtn = document.getElementById("desktop-auth-btn");
const mobileAuthBtn = document.getElementById("mobile-auth-btn");

// Update the text & state of auth buttons
export async function updateAuthButtons() {
  try {
    const res = await fetch(`${API_BASE}/user`, { credentials: "include" });
    const data = await res.json();

    if (data.user) {
      desktopAuthBtn.textContent = "Logout";
      desktopAuthBtn.dataset.action = "logout";

      mobileAuthBtn.textContent = "Logout";
      mobileAuthBtn.dataset.action = "logout";
    } else {
      desktopAuthBtn.textContent = "Sign in";
      desktopAuthBtn.dataset.action = "login";

      mobileAuthBtn.textContent = "Sign in";
      mobileAuthBtn.dataset.action = "login";
    }
  } catch (err) {
    console.error("User check error:", err);
  }
}

// Login with Google, exchange ID token for session cookie
async function login() {
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

// Logout, clear session cookie and Firebase auth
async function logout() {
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

// Attach event listeners
document.addEventListener("DOMContentLoaded", () => {
  [desktopAuthBtn, mobileAuthBtn].forEach(btn =>
    btn?.addEventListener("click", async (e) => {
      e.preventDefault();

      if (btn.dataset.action === "login") {
        await login();
      } else {
        await logout();
      }

      closeMobileMenu();
    })
  );

  updateAuthButtons();
});