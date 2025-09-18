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
const desktopLoginBtn = document.getElementById("desktop-login-btn");
const desktopLogoutBtn = document.getElementById("desktop-logout-btn");
const mobileLoginBtn = document.getElementById("mobile-login-btn");
const mobileLogoutBtn = document.getElementById("mobile-logout-btn");

// Update the visibility of login/logout buttons
export async function updateAuthButtons() {
  try {
    const res = await fetch(`${API_BASE}/user`, { credentials: "include" });
    const data = await res.json();

    if (data.user) {
      desktopLoginBtn?.style.setProperty("display", "none");
      desktopLogoutBtn?.style.setProperty("display", "inline-block");
      mobileLoginBtn?.style.setProperty("display", "none");
      mobileLogoutBtn?.style.setProperty("display", "inline-block");
    } else {
      desktopLoginBtn?.style.setProperty("display", "inline-block");
      desktopLogoutBtn?.style.setProperty("display", "none");
      mobileLoginBtn?.style.setProperty("display", "inline-block");
      mobileLogoutBtn?.style.setProperty("display", "none");
    }
  } catch (err) {
    console.error("User check error:", err);
  }
}

// Login with Google, exchange ID token for session cookie
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

// Logout, clear session cookie and Firebase auth
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

// Attach event listeners
document.addEventListener("DOMContentLoaded", () => {
  [desktopLoginBtn, mobileLoginBtn].forEach(btn =>
    btn?.addEventListener("click", (e) => {
      e.preventDefault();
      login().then(() => closeMobileMenu());
    })
  );

  [desktopLogoutBtn, mobileLogoutBtn].forEach(btn =>
    btn?.addEventListener("click", (e) => {
      e.preventDefault();
      logout().then(() => closeMobileMenu());
    })
  );

  updateAuthButtons();
});