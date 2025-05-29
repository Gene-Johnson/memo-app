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

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCeqAyGtVwv0eCxKn0R8aQ-wfISdIyibFU",
  authDomain: "memoboard-5860e.firebaseapp.com",
  projectId: "memoboard-5860e",
  storageBucket: "memoboard-5860e.firebasestorage.app",
  messagingSenderId: "476981178446",
  appId: "1:476981178446:web:474fe3fe0a4eeb8f1c531f",
  measurementId: "G-XN6415BKW7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//const db = firebase.firestore();
const auth = firebase.auth();

// DOM Elements
const userInfo = document.getElementById('user-info');
const memoForm = document.getElementById('memo-form');
const memoText = document.getElementById('memo-text');
const importantCheckbox = document.getElementById('important-checkbox');
const memoList = document.getElementById('memo-list');
const adminTools = document.getElementById('adminTools');
const showDeleted = document.getElementById('showDeleted');
const createBoardForm = document.getElementById('create-board-form');
const boardNameInput = document.getElementById('board-name');
const boardsList = document.getElementById('boards-list');
const settingsButton = document.getElementById('settings-button');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');

// Authentication
auth.onAuthStateChanged(user => {
  if (user) {
    userInfo.textContent = `Signed in as ${user.displayName || user.email}`;
    loadBoards();
    loadMemos();
    checkAdmin(user.uid);
  } else {
    auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
});

// Create Board
createBoardForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const boardName = boardNameInput.value.trim();
  if (boardName) {
    const user = auth.currentUser;
    if (user) {
      await db.collection('boards').add({
        name: boardName,
        owner: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      boardNameInput.value = '';
      loadBoards();
    } else {
      alert('You must be signed in to create a board.');
    }
  }
});

// Load Boards
async function loadBoards() {
  boardsList.innerHTML = '';
  const snapshot = await db.collection('boards').orderBy('createdAt').get();
  snapshot.forEach(doc => {
    const board = doc.data();
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `board.html?id=${doc.id}`;
    link.textContent = board.name;
    li.appendChild(link);
    boardsList.appendChild(li);
  });
}

// Submit Memo
memoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const content = memoText.value.trim();
  const important = importantCheckbox.checked;
  if (content) {
    const user = auth.currentUser;
    if (user) {
      await db.collection('memos').add({
        content,
        important,
        uid: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      memoText.value = '';
      importantCheckbox.checked = false;
      loadMemos();
    } else {
      alert('You must be signed in to submit a memo.');
    }
  }
});

// Load Memos
async function loadMemos() {
  memoList.innerHTML = '';
  const snapshot = await db.collection('memos').orderBy('createdAt', 'desc').get();
  snapshot.forEach(doc => {
    const memo = doc.data();
    const li = document.createElement('li');
    li.textContent = memo.content;
    memoList.appendChild(li);
  });
}

// Check Admin
async function checkAdmin(uid) {
  const adminDoc = await db.collection('admins').doc(uid).get();
  if (adminDoc.exists) {
    adminTools.style.display = 'block';
  }
}

// Settings Modal Functionality
settingsButton.addEventListener('click', () => {
  settingsModal.style.display = 'block';
});

closeSettings.addEventListener('click', () => {
  settingsModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target == settingsModal) {
    settingsModal.style.display = 'none';
  }
});

});
