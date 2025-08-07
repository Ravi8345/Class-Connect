import { auth, db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const logoutBtn = document.getElementById("logoutBtn");
const appointmentsList = document.getElementById("appointmentsList");
const appointmentForm = document.getElementById("appointmentForm");
const teacherSelect = document.getElementById("teacherSelect");

let currentUser = null;

// Check if user is logged in
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await loadTeachers();
    listenToAppointments();
  } else {
    window.location.href = "login.html";
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

// Load teachers from Firestore for dropdown
async function loadTeachers() {
  const teachersQuery = query(
    collection(db, "users"),
    where("role", "==", "teacher"),
    where("approved", "==", true)
  );
  const querySnapshot = await getDocs(teachersQuery);
  teacherSelect.innerHTML = '<option value="">--Select Teacher--</option>';

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = data.name + " (" + (data.department || "N/A") + ")";
    teacherSelect.appendChild(option);
  });
}

// Listen to student's appointments realtime
function listenToAppointments() {
  const appointmentsQuery = query(
    collection(db, "appointments"),
    where("studentId", "==", currentUser.uid),
    orderBy("dateTime", "asc")
  );

  onSnapshot(appointmentsQuery, (snapshot) => {
    appointmentsList.innerHTML = "";

    if (snapshot.empty) {
      appointmentsList.innerHTML = "<li>No appointments booked yet.</li>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const appt = docSnap.data();
      const dateStr = appt.dateTime?.seconds
        ? new Date(appt.dateTime.seconds * 1000).toLocaleString()
        : new Date(appt.dateTime).toLocaleString();

      const li = document.createElement("li");
      li.textContent = `With ${appt.teacherName} on ${dateStr} - Status: ${appt.status}`;
      appointmentsList.appendChild(li);
    });
  });
}

// Handle new appointment booking
appointmentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const teacherId = teacherSelect.value;
  const dateTimeValue = document.getElementById("date").value;
  const purpose = document.getElementById("purpose").value.trim();

  if (!teacherId || !dateTimeValue || !purpose) {
    alert("Please fill all fields");
    return;
  }

  try {
    // Get teacher info for name
    const teacherDocRef = doc(db, "users", teacherId);
    const teacherDoc = await getDoc(teacherDocRef);
    const teacherName = teacherDoc.exists() ? teacherDoc.data().name : "Teacher";

    await addDoc(collection(db, "appointments"), {
      studentId: currentUser.uid,
      teacherId,
      teacherName,
      dateTime: new Date(dateTimeValue),
      purpose,
      status: "Pending",
      createdAt: serverTimestamp(),
    });

    alert("Appointment requested!");
    appointmentForm.reset();
  } catch (error) {
    console.error("Error booking appointment:", error);
    alert("Failed to book appointment: " + error.message);
  }
});
