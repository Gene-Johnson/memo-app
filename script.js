let notes = JSON.parse(localStorage.getItem('notes')) || [];

function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

function addNote() {
  const input = document.getElementById('noteInput');
  const text = input.value.trim();
  if (!text) return;

  notes.unshift({ text, timestamp: Date.now() });
  input.value = '';
  saveNotes();
  renderNotes();
}

function renderNotes() {
  const list = document.getElementById('notesList');
  list.innerHTML = '';

  notes.forEach(note => {
    const li = document.createElement('li');
    li.textContent = note.text;
    list.appendChild(li);
  });
}

function sortNotes() {
  const method = document.getElementById('sortSelect').value;
  if (method === 'newest') {
    notes.sort((a, b) => b.timestamp - a.timestamp);
  } else if (method === 'oldest') {
    notes.sort((a, b) => a.timestamp - b.timestamp);
  } else if (method === 'az') {
    notes.sort((a, b) => a.text.localeCompare(b.text));
  } else if (method === 'za') {
    notes.sort((a, b) => b.text.localeCompare(a.text));
  }
  renderNotes();
}

renderNotes();
