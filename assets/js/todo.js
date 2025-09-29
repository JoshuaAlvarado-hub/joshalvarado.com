// Detect environment
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_BASE = isLocalhost ? null : "https://api.joshalvarado.com";

// Local sample tasks
let sampleTodos = [
    { id: "1", text: "Finish homework", completed: false, dueDate: "2025-10-01T12:00:00Z" },
    { id: "2", text: "Buy groceries", completed: true, dueDate: "2025-10-02T18:00:00Z" },
    { id: "3", text: "Call mom", completed: false, dueDate: "2025-10-03T09:30:00Z" }
];

// UI Helpers
function showAuthUI(user) {
    const greeting = document.getElementById("greeting");

    if (user) {
        const firstName = user.name ? user.name.split(" ")[0] : "Local User";
        greeting.textContent = `Hello, ${firstName}`;
        document.querySelector(".todo-wrapper").style.display = "";
        document.getElementById("todo-list").style.display = "";
    } else {
        greeting.innerHTML = "Hello, please sign in to view your tasks.";
        document.querySelector(".todo-wrapper").style.display = "none";
        document.getElementById("todo-list").style.display = "none";
    }
}

// Render a todo
function renderTodo(todo) {
    const todoList = document.getElementById("todo-list");
    const li = document.createElement("li");
    li.dataset.id = todo.id;
    li.className = "todo-item";

    // Due date
    if (todo.dueDate) {
        const dueDateDiv = document.createElement("div");
        dueDateDiv.className = "due-date";
        dueDateDiv.textContent = `Due: ${new Date(todo.dueDate).toLocaleString()}`;
        li.appendChild(dueDateDiv);
    }

    // Checkbox
    const label = document.createElement("label");
    label.className = "circle-checkbox";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => {
        if (isLocalhost) {
            todo.completed = checkbox.checked;
        } else {
            fetch(`${API_BASE}/api/todos/${todo.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: checkbox.checked }),
                credentials: "include",
            }).catch(() => alert("Error updating task."));
        }
    });

    const checkmark = document.createElement("span");
    checkmark.className = "checkmark";

    label.append(checkbox, checkmark);

    // Text input
    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.value = todo.text;
    textInput.addEventListener("change", () => {
        if (isLocalhost) {
            todo.text = textInput.value;
        } else {
            fetch(`${API_BASE}/api/todos/${todo.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: textInput.value }),
                credentials: "include",
            }).catch(() => alert("Error saving changes."));
        }
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", () => {
        if (isLocalhost) {
            sampleTodos = sampleTodos.filter((t) => t.id !== todo.id);
            li.remove();
        } else {
            fetch(`${API_BASE}/api/todos/${todo.id}`, {
                method: "DELETE",
                credentials: "include",
            })
                .then(() => li.remove())
                .catch(() => alert("Error deleting task."));
        }
    });

    li.append(label, textInput, deleteBtn);
    todoList.appendChild(li);
}

// Load todos
function loadTodos() {
    const todoList = document.getElementById("todo-list");
    todoList.innerHTML = "";

    if (isLocalhost) {
        showAuthUI({ name: "Local Tester" });
        sampleTodos.forEach(renderTodo);
    } else {
        fetch(`${API_BASE}/api/todos`, { credentials: "include" })
            .then((res) => {
                if (res.status === 401) {
                    showAuthUI(null);
                    return [];
                }
                return res.json();
            })
            .then((todos) => {
                todoList.innerHTML = "";
                todos.forEach(renderTodo);
            })
            .catch(() => alert("Error loading todos."));
    }
}

// Auth + Loading
function checkAuthAndLoadTodos() {
    if (isLocalhost) {
        loadTodos();
    } else {
        fetch(`${API_BASE}/api/user`, { credentials: "include" })
            .then((res) => res.json())
            .then((data) => {
                showAuthUI(data.user);
                if (data.user) loadTodos();
            })
            .catch(() => showAuthUI(null));
    }
}

// Add todos
document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("add-todo-btn");
    const input = document.getElementById("todo-input");
    const dueInput = document.getElementById("due-date");

    if (addBtn && input) {
        function addTodo() {
            const text = input.value.trim();
            const dueDate = dueInput && dueInput.value ? new Date(dueInput.value).toISOString() : null;

            if (text) {
                if (isLocalhost) {
                    const newTodo = {
                        id: Date.now().toString(),
                        text,
                        completed: false,
                        dueDate,
                    };
                    sampleTodos.push(newTodo);
                    renderTodo(newTodo);
                } else {
                    fetch(`${API_BASE}/api/todos`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            text,
                            completed: false,
                            dueDate,
                        }),
                        credentials: "include",
                    })
                        .then((res) => res.json())
                        .then((newTodo) => {
                            renderTodo(newTodo);
                        })
                        .catch(() => alert("Error adding task."));
                }

                input.value = "";
                if (dueInput) dueInput.value = "";
            }
        }

        addBtn.addEventListener("click", addTodo);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                addTodo();
            }
        });
    }
});

// Cookie Consent
function hasConsentedToCookies() {
    return localStorage.getItem("cookieConsent") === "true";
}

document.addEventListener("DOMContentLoaded", () => {
    const banner = document.getElementById("cookie-banner");
    const acceptBtn = document.getElementById("accept-cookies");

    if (!banner || !acceptBtn) return;

    if (hasConsentedToCookies() || isLocalhost) {
        checkAuthAndLoadTodos();
    } else {
        banner.style.display = "block";
    }

    if (acceptBtn) {
        acceptBtn.addEventListener("click", () => {
            localStorage.setItem("cookieConsent", "true");
            banner.style.display = "none";
            checkAuthAndLoadTodos();
        });
    }
});