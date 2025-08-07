import { auth, db } from "./firebase.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const logoutBtn = document.getElementById("logoutBtn");
const appointmentRequests = document.getElementById("appointmentRequests");

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    listenToAppointments();
  } else {
    window.location.href = "login.html";
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

function listenToAppointments() {
  const q = query(
    collection(db, "appointments"),
    where("teacherId", "==", currentUser.uid)
  );

  onSnapshot(q, async (snapshot) => {
    appointmentRequests.innerHTML = "";

    if (snapshot.empty) {
      appointmentRequests.innerHTML = "<li>No appointment requests.</li>";
      return;
    }

    // Use for...of loop to handle async calls inside snapshot.docs
    for (const docSnap of snapshot.docs) {
      const appt = docSnap.data();

      // Fetch student name
      let studentName = "Unknown Student";
      try {
        const studentDoc = await getDoc(doc(db, "users", appt.studentId));
        if (studentDoc.exists()) {
          studentName = studentDoc.data().name || studentName;
        }
      } catch (err) {
        console.error("Error fetching student data:", err);
      }

      const li = document.createElement("li");
      li.innerHTML = `
        <b>Student:</b> ${studentName}<br/>
        <b>Date & Time:</b> ${new Date(appt.dateTime.seconds * 1000).toLocaleString()}<br/>
        <b>Purpose:</b> ${appt.purpose}<br/>
        <b>Status:</b> ${appt.status}<br/>
        <button class="approveBtn">Approve</button>
        <button class="cancelBtn">Cancel</button>
      `;

      // Approve appointment
      li.querySelector(".approveBtn").addEventListener("click", async () => {
        await updateDoc(doc(db, "appointments", docSnap.id), {
          status: "Approved",
        });
      });

      // Cancel appointment
      li.querySelector(".cancelBtn").addEventListener("click", async () => {
        await updateDoc(doc(db, "appointments", docSnap.id), {
          status: "Cancelled",
        });
      });

      appointmentRequests.appendChild(li);
    }
  });
}
