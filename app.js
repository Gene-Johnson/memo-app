import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

import {
  getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc,
  getDocs, updateDoc, doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

import {
  getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCeqAyGtVwv0eCxKn0R8aQ-wfISdIyibFU",
  authDomain: "memoboard-5860e.firebaseapp.com",
  projectId: "memoboard-5860e",
  storageBucket: "memoboard-5860e.firebasestorage.app",
  messagingSenderId: "476981178446",
  appId: "1:476981178446:web:474fe3fe0a4eeb8f1c531f",
  measurementId: "G-XN6415BKW7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const memoForm = document.getElementById("memo-form");
const memoText = document.getElementById("memo-text");
const importantCheck = document.getElementById("important-checkbox");
const memoList = document.getElementById("memo-list");
const userInfo = document.getElementById("user-info");
const adminTools = document.getElementById("adminTools");
const showDeletedToggle = document.getElementById("showDeleted");

let currentUser = null;
let isAdmin = false;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    userInfo.textContent = `Signed in as ${user.displayName || user.email}`;
    await checkAdmin();
    if (isAdmin) adminTools.style.display = "block";
    loadMemos();
  } else {
    signInWithPopup(auth, provider)
      .then(result => {
        currentUser = result.user;
        userInfo.textContent = `Signed in as ${currentUser.displayName || currentUser.email}`;
        checkAdmin().then(loadMemos);
      })
      .catch(err => console.error("Login failed", err));
  }
});

async function checkAdmin() {
  const snap = await getDocs(collection(db, "admins"));
  isAdmin = snap.docs.some(doc => doc.id === currentUser.uid);
}

function loadMemos() {
  const q = query(collection(db, "memos"), orderBy("timestamp", "desc"));
  onSnapshot(q, snapshot => {
    memoList.innerHTML = '';
    snapshot.forEach(docSnap => {
      const note = docSnap.data();
      const noteId = docSnap.id;

      if (note.deleted && (!isAdmin || !showDeletedToggle.checked)) return;

      const li = document.createElement("li");
      li.className = "memo-item";
      if (note.important) li.classList.add("important");
      if (note.deleted) li.style.opacity = 0.4;

      li.textContent = `[${note.user || "Guest"}] ${note.text}`;

      if (isAdmin || currentUser?.uid === note.uid) {
        const delBtn = document.createElement("button");
        delBtn.textContent = note.deleted ? "Restore" : "Delete";
        delBtn.classList.add("delete-button");
        delBtn.onclick = async () => {
          await updateDoc(doc(db, "memos", noteId), { deleted: !note.deleted });
        };
        li.appendChild(delBtn);
      }

      memoList.appendChild(li);
    });
  });
}

showDeletedToggle?.addEventListener("change", loadMemos);

memoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = memoText.value.trim();
  const important = importantCheck.checked;
  if (!text) return;

  if (important) {
    const q = query(collection(db, "memos"), where("uid", "==", currentUser.uid), where("important", "==", true));
    const oldImportant = await getDocs(q);
    oldImportant.forEach(async d => {
      await deleteDoc(doc(db, "memos", d.id));
    });
  }

  await addDoc(collection(db, "memos"), {
    uid: currentUser.uid,
    user: currentUser.displayName || "User",
    text,
    important,
    timestamp: serverTimestamp(),
    deleted: false
  });

  memoText.value = "";
  importantCheck.checked = false;
});
