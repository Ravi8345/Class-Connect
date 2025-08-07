
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCCW1IiXtwt6a4u5SzxAJbv6a_RLpR4SPQ",
  authDomain: "student-teacher-booking-2025.firebaseapp.com",
  projectId: "student-teacher-booking-2025",
  storageBucket: "student-teacher-booking-2025.appspot.com",
  messagingSenderId: "852654837554",
  appId: "1:852654837554:web:54b1b976c09d70c85d512b"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);  // <-- Use getFirestore here

const auth = getAuth(app);

export { auth, db };
