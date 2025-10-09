// todo.js

// Config
const API_BASE = 'https://api.joshalvarado.com';
// const API_BASE = 'https://localhost:3001';
const LOCAL_TESTING = true; // set true for local sample data

let allTodos = []; // store loaded todos globally

function setTodoPalette(paletteName) {
  const container = document.querySelector('.todo-app');
  if (!container) return;
  container.classList.remove('palette-dark', 'palette-pastel', 'palette-halloween');
  if (paletteName) container.classList.add(paletteName);
}

// small helper used below for sorting
function sortTodosArray(arr) {
  return arr.slice().sort((a, b) => {
    const farFuture = 8640000000000000; // very large timestamp
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : farFuture;
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : farFuture;
    return dateA - dateB;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // pick default palette (you can change)
  setTodoPalette('palette-halloween');

  // wire up cookie-banner logic & loading (keeps your existing behaviour)
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('accept-cookies');

  if (!banner || !acceptBtn) {
    // still call the load/auth flow if cookie elements missing
    checkAuthAndLoadTodos();
  } else {
    if (hasConsentedToCookies()) {
      checkAuthAndLoadTodos();
    } else {
      banner.style.display = 'block';
    }

    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'true');
      banner.style.display = 'none';
      checkAuthAndLoadTodos();
    });
  }

  // wire up add button + enter key
  const addBtn = document.getElementById('add-todo-btn');
  const input = document.getElementById('todo-input');
  const dueInput = document.getElementById('due-date');

  if (addBtn && input) {
    // addTodo function declared below is used here
    addBtn.addEventListener('click', addTodo);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTodo();
      }
    });
  }
});

// Helper to check if a date is today
function isToday(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() &&
         date.getMonth() === now.getMonth() &&
         date.getDate() === now.getDate();
}

// Date formatting helper
function formatDueDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getLocalISODate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day); // local time
  return date.toISOString();
}

// UI Helpers
function showAuthUI(user) {
  const greeting = document.getElementById('greeting');
  const todoList = document.getElementById('todo-list');
  const categories = document.querySelector('.todo-grid');

  if (user) {
    if (greeting) greeting.textContent = `Hello, ${user.name.split(' ')[0]}`;
    if (todoList) todoList.style.display = '';
    if (categories) categories.style.display = '';
  } else {
    if (greeting) greeting.textContent = 'Hello, please sign in to view your tasks.';
    if (todoList) todoList.style.display = 'none';
    if (categories) categories.style.display = 'none';
  }
}

// Update category counts
function updateCategoryCounts() {
  const allCountSpan = document.querySelector('.category:nth-child(2) .count'); // All
  const todayCountSpan = document.querySelector('.category:nth-child(1) .count'); // Today

  if (allCountSpan) allCountSpan.textContent = allTodos.length;
  if (todayCountSpan) {
    const todayCount = allTodos.filter(todo => todo.dueDate && isToday(todo.dueDate)).length;
    todayCountSpan.textContent = todayCount;
  }
}

// Auth + Loading
function checkAuthAndLoadTodos() {
  if (LOCAL_TESTING) {
    // populate allTodos and render via the same pathway (so sorting works)
    allTodos = [
      { id: 123, text: "Today", completed: false, dueDate: "2025-10-09T00:00:00" },
      { id: 124, text: "All", completed: false },
      { id: 125, text: "Overdue", completed: false, dueDate: "2001-03-23T12:00:00" },
      { id: 126, text: "Completed", completed: true, dueDate: "2025-10-31T12:00:00" }
    ];

    showAuthUI({ name: "Local Tester" });
    renderAllTodos();
    return;
  }

  fetch(`${API_BASE}/api/user`, { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      showAuthUI(data.user);
      if (data.user) loadTodos();
    })
    .catch(() => showAuthUI(null));
}

// Renders a single todo item (keeps markup/behaviour from your original)
function renderTodo(todo, todoList = document.getElementById('todo-list')) {
  const li = document.createElement('li');
  li.dataset.id = todo.id;

  // pill container
  const pill = document.createElement('div');
  pill.classList.add('pill-container');

  // checkbox
  const checkboxLabel = document.createElement('label');
  checkboxLabel.classList.add('circle-checkbox');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = !!todo.completed;
  checkbox.addEventListener('change', () => {
    // update backend (if not LOCAL_TESTING)
    if (!LOCAL_TESTING) {
      fetch(`${API_BASE}/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: checkbox.checked }),
        credentials: 'include'
      }).catch(() => alert('Error updating task.'));
    } else {
      // local testing: update in-memory
      const found = allTodos.find(t => t.id === todo.id);
      if (found) found.completed = checkbox.checked;
      updateCategoryCounts();
    }
  });
  const checkmark = document.createElement('span');
  checkmark.classList.add('checkmark');
  checkboxLabel.append(checkbox, checkmark);

  // task wrapper (date + text stacked)
  const taskWrapper = document.createElement('div');
  taskWrapper.classList.add('task-wrapper');

  if (todo.dueDate) {
    const dueDiv = document.createElement('div');
    dueDiv.classList.add('todo-due');
    dueDiv.textContent = `Due: ${formatDueDate(todo.dueDate)}`;
    taskWrapper.appendChild(dueDiv);
  }

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.value = todo.text || '';
  textInput.addEventListener('change', () => {
    if (!LOCAL_TESTING) {
      fetch(`${API_BASE}/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput.value }),
        credentials: 'include'
      }).catch(() => alert('Error saving changes.'));
    } else {
      const found = allTodos.find(t => t.id === todo.id);
      if (found) found.text = textInput.value;
    }
  });
  taskWrapper.appendChild(textInput);

  // delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', () => {
    if (!LOCAL_TESTING) {
      fetch(`${API_BASE}/api/todos/${todo.id}`, {
        method: 'DELETE',
        credentials: 'include'
      }).then(() => {
        li.remove();
        allTodos = allTodos.filter(t => t.id !== todo.id);
        updateCategoryCounts();
      }).catch(() => alert('Error deleting task.'));
    } else {
      li.remove();
      allTodos = allTodos.filter(t => t.id !== todo.id);
      updateCategoryCounts();
    }
  });

  // assemble
  pill.append(checkboxLabel, taskWrapper, deleteBtn);
  li.appendChild(pill);

  // append to the list (preserve order from the array)
  todoList.appendChild(li);
}

// Remove existing non-add items and re-render allTodos in sorted order
function renderAllTodos() {
  const todoList = document.getElementById('todo-list');
  if (!todoList) return;

  // remove previous todo items but keep the add-todo-item
  todoList.querySelectorAll('li:not(.add-todo-item)').forEach(el => el.remove());

  // sort then render
  const sorted = sortTodosArray(allTodos);
  sorted.forEach(todo => renderTodo(todo, todoList));
  updateCategoryCounts();
}

// Load from API and render sorted
function loadTodos() {
  fetch(`${API_BASE}/api/todos`, { credentials: 'include' })
    .then(res => {
      if (res.status === 401) {
        showAuthUI(null);
        return [];
      }
      return res.json();
    })
    .then(todos => {
      // store and sort
      allTodos = sortTodosArray(todos);
      renderAllTodos();
    })
    .catch(() => alert('Error loading todos.'));
}

// Only Today tasks (keeps original behaviour, but uses global array)
function renderTodayTodos() {
  const todoList = document.getElementById('todo-list');
  if (!todoList) return;
  todoList.querySelectorAll('li:not(.add-todo-item)').forEach(el => el.remove());

  allTodos
    .filter(todo => todo.dueDate && isToday(todo.dueDate))
    .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))
    .forEach(todo => renderTodo(todo, todoList));
}

// Add todos - respects LOCAL_TESTING and re-renders sorted list after add
function addTodo() {
  const input = document.getElementById('todo-input');
  const dueInput = document.getElementById('due-date');
  if (!input) return;

  const text = input.value.trim();
  const dueDate = dueInput && dueInput.value ? getLocalISODate(dueInput.value) : null;
  if (!text) return;

  if (LOCAL_TESTING) {
    // simulate server response
    const fakeId = Date.now();
    const newTodo = { id: fakeId, text, completed: false, dueDate };
    allTodos.push(newTodo);
    // sort & re-render
    allTodos = sortTodosArray(allTodos);
    renderAllTodos();

    // reset inputs
    input.value = '';
    if (dueInput) dueInput.value = '';
    return;
  }

  // real server flow
  fetch(`${API_BASE}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, completed: false, dueDate }),
    credentials: 'include'
  })
    .then(res => res.json())
    .then(newTodo => {
      allTodos.push(newTodo);
      allTodos = sortTodosArray(allTodos);
      renderAllTodos();

      input.value = '';
      if (dueInput) dueInput.value = '';
    })
    .catch(() => alert('Error adding task.'));
}

// Cookie Consent helper (used by DOMContentLoaded handler above)
function hasConsentedToCookies() {
  return localStorage.getItem('cookieConsent') === 'true';
}