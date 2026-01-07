import { auth } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "firebase/auth";

// DOM Elements
const authModal = document.getElementById('auth-modal');
const authBtn = document.getElementById('auth-btn');
const closeAuth = document.getElementById('close-auth');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authToggleText = document.getElementById('auth-toggle-text');
const authSwitchBtn = document.getElementById('auth-switch-btn');
const authUsername = document.getElementById('auth-username');
const userInfo = document.getElementById('user-info');
const userEmailDisplay = document.getElementById('user-email-display');
const logoutBtn = document.getElementById('logout-btn');

let isLoginMode = true;
let currentUser = null;

// UI Toggles
authBtn.addEventListener('click', () => {
    authModal.classList.add('show');
});

closeAuth.addEventListener('click', () => {
    authModal.classList.remove('show');
});

authSwitchBtn.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        authTitle.innerText = "Login";
        authSubmitBtn.innerText = "Login";
        authSwitchBtn.innerText = "Sign Up";
        authUsername.style.display = "none";
        authUsername.required = false;
        authToggleText.innerHTML = 'Don\'t have an account? <span id="auth-switch-btn">Sign Up</span>';
    } else {
        authTitle.innerText = "Sign Up";
        authSubmitBtn.innerText = "Sign Up";
        authSwitchBtn.innerText = "Login";
        authUsername.style.display = "block";
        authUsername.required = true;
        authToggleText.innerHTML = 'Already have an account? <span id="auth-switch-btn">Login</span>';
    }
    // Re-attach event listener to new span because innerHTML replaced it
    document.getElementById('auth-switch-btn').addEventListener('click', () => authSwitchBtn.click());
});

// Auth Logic
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const username = authUsername.value;

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Logged in successfully!");
            authModal.classList.remove('show');
        } else {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Set Display Name
            if (username) {
                await updateProfile(userCredential.user, {
                    displayName: username
                });
            }
            alert("Account created!");
            authModal.classList.remove('show');
        }
    } catch (error) {
        alert(error.message);
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    alert("Logged out!");
});

// State Monitor
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        authForm.style.display = 'none';
        authToggleText.style.display = 'none';
        userInfo.style.display = 'block';
        userEmailDisplay.innerText = user.displayName || user.email;
        authBtn.innerText = '👤✅'; // Indicate logged in
        authBtn.title = `Logged in as ${user.displayName || user.email}`;
    } else {
        authForm.style.display = 'flex';
        authToggleText.style.display = 'block';
        userInfo.style.display = 'none';
        authBtn.innerText = '👤';
        authBtn.title = "Login/Profile";
    }
});

export function getUser() {
    return currentUser;
}
