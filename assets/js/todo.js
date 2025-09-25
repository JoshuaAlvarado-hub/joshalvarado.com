// Config
const API_BASE = 'https://api.joshalvarado.com';
// const API_BASE = 'https://localhost:3001';
const LOCAL_TESTING = false;

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

    // pill container (hoverable)
    const pillContainer = document.createElement('div');
    pillContainer.classList.add('pill-container');

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
        });
    });
    const checkmark = document.createElement('span');
    checkmark.classList.add('checkmark');
    checkboxLabel.append(checkbox, checkmark);

    // task wrapper
    const taskWrapper = document.createElement('div');
    taskWrapper.classList.add('task-wrapper');

    if (todo.dueDate) {
        const dueDiv = document.createElement('div');
        dueDiv.classList.add('todo-due');
        dueDiv.textContent = `Due: ${new Date(todo.dueDate).toLocaleString()}`;
        taskWrapper.appendChild(dueDiv);
    }

    const label = document.createElement('input');
    label.type = 'text';
    label.value = todo.text;
    label.addEventListener('change', () => {
        fetch(`${API_BASE}/api/todos/${todo.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: label.value }),
            credentials: 'include'
        });
    });
    taskWrapper.appendChild(label);

    // delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', () => {
        fetch(`${API_BASE}/api/todos/${todo.id}`, {
            method: 'DELETE',
            credentials: 'include'
        }).then(() => li.remove());
    });

    // assemble
    pillContainer.append(checkboxLabel, taskWrapper, deleteBtn);
    li.appendChild(pillContainer);
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
            const dueInput = document.getElementById('due-date');
            const dueDate = dueInput.value ? new Date(dueInput.value).toISOString() : null;

            if (text) {
                fetch(`${API_BASE}/api/todos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, completed: false, dueDate }),
                    credentials: 'include'
                })
                .then(res => res.json())
                .then(() => {
                    input.value = '';
                    dueInput.value = '';
                    loadTodos();
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
