// driver.js

// Config
const API_BASE = 'https://api.joshalvarado.com';
// const API_BASE = 'http://localhost:3001'; // for local API testing
const LOCAL_TESTING = false; // set false when using live API

let allItems = []; // global array of delivery entries

// --- DOMContentLoaded ---

document.addEventListener('DOMContentLoaded', () => {
  if (LOCAL_TESTING) {
    loadLocalSampleData();
  } else {
    loadItemsFromAPI();
  }

  const addBtn = document.getElementById('add-item-btn');
  const input = document.getElementById('item-input');

  if (addBtn && input) {
    addBtn.addEventListener('click', addItem);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addItem();
      }
    });
  }
});

// --- Local sample mode ---

function loadLocalSampleData() {
  allItems = [
    { id: 1, title: '123 Main St', details: 'Leave at front door', completed: false },
    { id: 2, title: '45 Industrial Way', details: 'Dock 3 – ask for Mike', completed: true },
    { id: 3, title: '87 Elm Ave', details: 'Apartment 2B – ring bell', completed: false },
  ];
  allItems = sortItems(allItems);
  render();
}

// --- API Mode ---

async function loadItemsFromAPI() {
  try {
    const res = await fetch(`${API_BASE}/api/items`);
    if (!res.ok) throw new Error('Failed to load delivery info');

    const items = await res.json();
    allItems = sortItems(items);
    render();
  } catch (err) {
    console.error(err);
    alert('Error loading delivery info.');
  }
}

async function addItem() {
  const titleInput = document.getElementById('item-title');
  const detailsInput = document.getElementById('item-details');
  if (!titleInput) return;

  const title = titleInput.value.trim();
  const details = detailsInput ? detailsInput.value.trim() : '';
  if (!title && !details) return;

  if (LOCAL_TESTING) {
    const newItem = {
      id: Date.now(),
      title,
      details,
      completed: false,
    };
    allItems.push(newItem);
    allItems = sortItems(allItems);
    render();

    titleInput.value = '';
    if (detailsInput) detailsInput.value = '';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, details, completed: false }),
    });

    if (!res.ok) throw new Error('Failed to add delivery info');

    const newItem = await res.json();
    allItems.push(newItem);
    allItems = sortItems(allItems);
    render();

    titleInput.value = '';
    if (detailsInput) detailsInput.value = '';
  } catch (err) {
    console.error(err);
    alert('Error adding delivery info.');
  }
}

async function updateItem(id, updates) {
  if (LOCAL_TESTING) return; // skip API for local mode
  try {
    const res = await fetch(`${API_BASE}/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update delivery info');
  } catch (err) {
    console.error(err);
    alert('Error saving changes.');
  }
}

async function deleteItem(id) {
  if (LOCAL_TESTING) {
    allItems = allItems.filter((i) => i.id !== id);
    render();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/items/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete delivery info');

    allItems = allItems.filter((i) => i.id !== id);
    render();
  } catch (err) {
    console.error(err);
    alert('Error deleting item.');
  }
}

// --- RENDERING ---

function render() {
  const list = document.getElementById('item-list');
  if (!list) return;

  // clear existing except add-entry row
  list.querySelectorAll('li:not(.add-entry-item)').forEach((el) => el.remove());

  allItems.forEach((item) => {
    const li = document.createElement('li');
    li.dataset.id = item.id;

    const pill = document.createElement('div');
    pill.classList.add('pill-container');

    // Entry content
    const entryWrapper = document.createElement('div');
    entryWrapper.classList.add('entry-wrapper');

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = item.title || '';
    titleInput.classList.add('entry-title');
    titleInput.addEventListener('change', () => {
      const found = allItems.find((i) => i.id === item.id);
      if (found) found.title = titleInput.value;
      updateItem(item.id, { title: titleInput.value });
    });

    const detailsInput = document.createElement('textarea');
    detailsInput.value = item.details || '';
    detailsInput.classList.add('entry-details');
    detailsInput.addEventListener('change', () => {
      const found = allItems.find((i) => i.id === item.id);
      if (found) found.details = detailsInput.value;
      updateItem(item.id, { details: detailsInput.value });
    });

    entryWrapper.append(titleInput, detailsInput);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '×';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => deleteItem(item.id));

    pill.append(entryWrapper, deleteBtn);
    li.appendChild(pill);
    list.appendChild(li);
  });
}

// --- Helpers ---

function sortItems(arr) {
  return arr.slice().sort((a, b) => {
    const clean = (str) => {
      if (!str) return '';
      // remove leading numbers and spaces
      return str.replace(/^\d+\s*/, '').toLowerCase();
    };
    return clean(a.title).localeCompare(clean(b.title));
  });
}