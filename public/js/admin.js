import { auth, db } from "./firebase.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const logoutBtn = document.getElementById("logoutBtn");
const pendingTeachersList = document.getElementById("pendingTeachersList");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    listenToPendingTeachers();
  } else {
    window.location.href = "login.html";
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

function listenToPendingTeachers() {
  const q = query(
    collection(db, "users"),
    where("role", "==", "teacher"),
    where("approved", "==", false)
  );

  onSnapshot(q, (snapshot) => {
    pendingTeachersList.innerHTML = "";

    if (snapshot.empty) {
      pendingTeachersList.innerHTML = "<li>No pending registrations.</li>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const user = docSnap.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="info">
          <b>Name:</b> ${user.name} <br/>
          <b>Email:</b> ${user.email} <br/>
          <b>Department:</b> ${user.department || "N/A"} <br/>
        </div>
        <div class="actions">
          <button class="approveBtn">Approve</button>
          <button class="rejectBtn">Reject</button>
        </div>
      `;

      li.querySelector(".approveBtn").addEventListener("click", async () => {
        await updateDoc(doc(db, "users", docSnap.id), { approved: true });
        alert(`Teacher ${user.name} approved.`);
      });

      li.querySelector(".rejectBtn").addEventListener("click", async () => {
        // Delete rejected user from DB
        await deleteDoc(doc(db, "users", docSnap.id));
        alert(`Teacher ${user.name} rejected and removed.`);
      });

      pendingTeachersList.appendChild(li);
    });
  });
}
