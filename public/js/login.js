// js/login.js
import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginform");

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Please fill in both email and password.");
      return;
    }

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        alert("No user data found. Please contact support.");
        await auth.signOut();
        return;
      }

      const userData = userDocSnap.data();

      // Check approval status
      if (!userData.approved) {
        alert("Your registration is pending approval.");
        await auth.signOut();
        return;
      }

      // Redirect based on role
      switch (userData.role) {
        case "student":
          window.location.href = "student.html";
          break;
        case "teacher":
          window.location.href = "teacher.html";
          break;
        case "admin":
          window.location.href = "admin.html";
          break;
        default:
          alert("Unknown user role. Please contact support.");
          await auth.signOut();
      }

    } catch (error) {
      console.error("Login error:", error.code, error.message);
      let message = "Login failed. Please check your email and password.";
      if (error.code === "auth/user-not-found") {
        message = "No user found with this email.";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address.";
      }
      alert(message);
    }
  });
});
