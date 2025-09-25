// Config
const API_BASE = 'https://api.joshalvarado.com';
// const API_BASE = 'https://localhost:3001';

// UI Helpers
function showAuthUI(user) {
    const greeting = document.getElementById('greeting');

    if (user) {
        const firstName = user.name.split(' ')[0];
        greeting.textContent = `Hello, ${firstName}`;
        document.querySelector('.todo-wrapper').style.display = '';
        document.getElementById('todo-list').style.display = '';
    } else {
        greeting.innerHTML = 'Hello, please sign in to view your tasks.';
        document.querySelector('.todo-wrapper').style.display = 'none';
        document.getElementById('todo-list').style.display = 'none';
    }
}

// Auth + Loading
// Check auth status and load todos if authenticated
function checkAuthAndLoadTodos() {
    fetch(`${API_BASE}/api/user`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            showAuthUI(data.user);
            if (data.user) loadTodos();
        })
        .catch(() => showAuthUI(null));
}

// Todos
function renderTodo(todo) {
    const todoList = document.getElementById('todo-list');
    const li = document.createElement('li');
    li.dataset.id = todo.id;

    const label = document.createElement('label');
    label.className = 'circle-checkbox';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => {
        fetch(`${API_BASE}/api/todos/${todo.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: checkbox.checked }),
            credentials: 'include'
        }).catch(() => alert('Error updating task.'));
    });

    const checkmark = document.createElement('span');
    checkmark.className = 'checkmark';

    label.append(checkbox, checkmark);

    // Task text input
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.value = todo.text;
    textInput.addEventListener('change', () => {
        fetch(`${API_BASE}/api/todos/${todo.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textInput.value }),
            credentials: 'include'
        }).catch(() => alert('Error saving changes.'));
    });

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'x';
    deleteBtn.addEventListener('click', () => {
        fetch(`${API_BASE}/api/todos/${todo.id}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(() => li.remove())
        .catch(() => alert('Error deleting task.'));
    });

    // Append everything to li
    li.append(label, textInput, deleteBtn);
    todoList.appendChild(li);
}

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
            const todoList = document.getElementById('todo-list');
            todoList.innerHTML = '';
            todos.forEach(renderTodo);
        })
        .catch(() => alert('Error loading todos.'));
}

// Add todos
document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('add-todo-btn');
    const input = document.getElementById('todo-input');

    if (addBtn && input) {
        function addTodo() {
            const text = input.value.trim();
            if (text) {
                fetch(`${API_BASE}/api/todos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, completed: false }),
                    credentials: 'include'
                })
                    .then(res => res.json())
                    .then(newTodo => {
                        input.value = '';
                        loadTodos();
                    })
                    .catch(() => alert('Error adding task.'));
            }
        }

        addBtn.addEventListener('click', addTodo);

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTodo();   // call directly instead of .click()
            }
        });
    }
});

// Cookie Consent
function hasConsentedToCookies() {
    return localStorage.getItem('cookieConsent') === 'true';
}

document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');

    if (!banner || !acceptBtn) return;

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
});