// Config
const API_BASE = 'https://api.joshalvarado.com';
// const API_BASE = 'https://localhost:3001';
const LOCAL_TESTING = false; // set true for local sample data

// Date formatting helper
function formatDueDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

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
function checkAuthAndLoadTodos() {
    if (LOCAL_TESTING) {
        showAuthUI({ name: "Local Tester" });

        renderTodo({
            id: 123,
            text: "Finish project report",
            completed: false,
            dueDate: "2025-09-30T17:00:00"
        });

        renderTodo({
            id: 124,
            text: "Buy groceries",
            completed: true,
            dueDate: "2025-09-26T12:00:00"
        });

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

// Todos
function renderTodo(todo) {
    const todoList = document.getElementById('todo-list');
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
    textInput.value = todo.text;
    textInput.addEventListener('change', () => {
        fetch(`${API_BASE}/api/todos/${todo.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textInput.value }),
            credentials: 'include'
        }).catch(() => alert('Error saving changes.'));
    });
    taskWrapper.appendChild(textInput);

    // delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', () => {
        fetch(`${API_BASE}/api/todos/${todo.id}`, {
            method: 'DELETE',
            credentials: 'include'
        })
            .then(() => li.remove())
            .catch(() => alert('Error deleting task.'));
    });

    // assemble
    pill.append(checkboxLabel, taskWrapper, deleteBtn);
    li.appendChild(pill);
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
    const dueInput = document.getElementById('due-date');

    if (addBtn && input) {
        function addTodo() {
            const text = input.value.trim();
            const dueDate = dueInput && dueInput.value ? new Date(dueInput.value).toISOString() : null;

            if (text) {
                fetch(`${API_BASE}/api/todos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, completed: false, dueDate }),
                    credentials: 'include'
                })
                    .then(res => res.json())
                    .then(newTodo => {
                        input.value = '';
                        if (dueInput) dueInput.value = '';
                        renderTodo(newTodo);
                    })
                    .catch(() => alert('Error adding task.'));
            }
        }

        addBtn.addEventListener('click', addTodo);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTodo();
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