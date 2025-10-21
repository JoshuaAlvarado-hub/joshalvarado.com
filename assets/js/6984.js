// Config
const API_BASE = 'https://api.joshalvarado.com';
// const API_BASE = 'http://localhost:3001'; // for local testing
const LOCAL_TESTING = true;

let allItems = []; // global array of delivery entries

document.addEventListener('DOMContentLoaded', () => {
  if (LOCAL_TESTING) {
    loadLocalSampleData();
  } else {
    loadItemsFromAPI();
  }

  const addBtn = document.getElementById('add-item-btn');
  // Add button uses the add-pill inputs (address, gate-code, door-code, notes)
  if (addBtn) {
    addBtn.addEventListener('click', addItem);

    const addressInput = document.getElementById('address');
    if (addressInput) {
      addressInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addItem();
        }
      });
    }
  }
});
// Local Test Data
function loadLocalSampleData() {
  // Use the richer shape locally: address, gateCode, doorCode, notes
  allItems = [
    { id: 1, address: '123 Main St', gateCode: '', doorCode: '', notes: 'Leave at front door' },
    { id: 2, address: '45 Industrial Way', gateCode: '', doorCode: '', notes: 'Dock 3 – ask for Mike' },
    { id: 3, address: '87 Elm Ave', gateCode: '', doorCode: '', notes: 'Apartment 2B – ring bell' },
  ];
  allItems = sortItems(allItems);
  render();
}

// API Functions
async function loadItemsFromAPI() {
  try {
    const res = await fetch(`${API_BASE}/api/items`);
    if (!res.ok) throw new Error('Failed to load delivery info');
    const items = await res.json();
    // Map legacy API shape (title/details) to client shape (address/notes)
    allItems = items.map((it) => ({
      id: it.id || it._id || it.docId || Date.now(),
      address: it.title || '',
      gateCode: it.gateCode || '',
      doorCode: it.doorCode || '',
      notes: it.details || '',
    }));
    allItems = sortItems(allItems);
    render();
  } catch (err) {
    console.error(err);
    alert('Error loading delivery info.');
  }
}
async function addItem() {
  const addressInput = document.getElementById('address');
  const gateInput = document.getElementById('gate-code');
  const doorInput = document.getElementById('door-code');
  const notesInput = document.getElementById('notes');

  if (!addressInput && !notesInput) return;

  const address = addressInput ? addressInput.value.trim() : '';
  const gateCode = gateInput ? gateInput.value.trim() : '';
  const doorCode = doorInput ? doorInput.value.trim() : '';
  const notes = notesInput ? notesInput.value.trim() : '';
  if (!address && !notes) return;

  if (LOCAL_TESTING) {
    const newItem = { id: Date.now(), address, gateCode, doorCode, notes };
    allItems.push(newItem);
    allItems = sortItems(allItems);
    render();
    if (addressInput) addressInput.value = '';
    if (gateInput) gateInput.value = '';
    if (doorInput) doorInput.value = '';
    if (notesInput) notesInput.value = '';
    return;
  }

  // When using the API, send legacy fields (title/details) for compatibility
  try {
    const body = {
      title: address,
      details: notes,
      // include new fields too (if backend ever supports them)
      gateCode,
      doorCode,
    };

    const res = await fetch(`${API_BASE}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to add delivery info');

    const saved = await res.json();
    // normalize into client shape
    const newItem = {
      id: saved.id || saved._id || Date.now(),
      address: saved.title || address,
      gateCode: saved.gateCode || gateCode,
      doorCode: saved.doorCode || doorCode,
      notes: saved.details || notes,
    };
    allItems.push(newItem);
    allItems = sortItems(allItems);
    render();

    if (addressInput) addressInput.value = '';
    if (gateInput) gateInput.value = '';
    if (doorInput) doorInput.value = '';
    if (notesInput) notesInput.value = '';
  } catch (err) {
    console.error(err);
    alert('Error adding delivery info.');
  }
}

async function updateItem(id, updates) {
  if (LOCAL_TESTING) return;

  try {
    // Map client updates to legacy API fields for compatibility
    const apiUpdates = {};
    if (updates.address !== undefined) apiUpdates.title = updates.address;
    if (updates.notes !== undefined) apiUpdates.details = updates.notes;
    if (updates.completed !== undefined) apiUpdates.completed = updates.completed;
    if (updates.gateCode !== undefined) apiUpdates.gateCode = updates.gateCode;
    if (updates.doorCode !== undefined) apiUpdates.doorCode = updates.doorCode;

    const res = await fetch(`${API_BASE}/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiUpdates),
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
    const res = await fetch(`${API_BASE}/api/items/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete delivery info');

    allItems = allItems.filter((i) => i.id !== id);
    render();
  } catch (err) {
    console.error(err);
    alert('Error deleting item.');
  }
}

// Rendering
function render() {
  const list = document.getElementById('item-list');
  if (!list) return;

  list.querySelectorAll('li:not(.add-entry-item)').forEach((el) => el.remove());

  allItems.forEach((item) => {
    const li = document.createElement('li');
    li.dataset.id = item.id;

    const pill = document.createElement('div');
    pill.classList.add('pill-container');

    const entryWrapper = document.createElement('div');
    entryWrapper.classList.add('entry-wrapper');

    // Address field
    const addressField = document.createElement('div');
    addressField.classList.add('entry-field');
    const addressLabel = document.createElement('label');
    addressLabel.classList.add('entry-label');
    addressLabel.textContent = 'Address';
    const addressInput = document.createElement('input');
    addressInput.type = 'text';
    addressInput.value = item.address || '';
    addressInput.placeholder = 'Address...';
    addressInput.addEventListener('change', () => {
      const found = allItems.find((i) => i.id === item.id);
      if (found) found.address = addressInput.value;
      updateItem(item.id, { address: addressInput.value });
    });
    addressField.append(addressLabel, addressInput);

    // Gate Code
    const gateField = document.createElement('div');
    gateField.classList.add('entry-field');
    const gateLabel = document.createElement('label');
    gateLabel.classList.add('entry-label');
    gateLabel.textContent = 'Gate Code';
    const gateInput = document.createElement('input');
    gateInput.type = 'text';
    gateInput.value = item.gateCode || '';
    gateInput.placeholder = 'Gate code...';
    gateInput.addEventListener('change', () => {
      const found = allItems.find((i) => i.id === item.id);
      if (found) found.gateCode = gateInput.value;
      updateItem(item.id, { gateCode: gateInput.value });
    });
    gateField.append(gateLabel, gateInput);

    // Door Code
    const doorField = document.createElement('div');
    doorField.classList.add('entry-field');
    const doorLabel = document.createElement('label');
    doorLabel.classList.add('entry-label');
    doorLabel.textContent = 'Door Code';
    const doorInput = document.createElement('input');
    doorInput.type = 'text';
    doorInput.value = item.doorCode || '';
    doorInput.placeholder = 'Door code...';
    doorInput.addEventListener('change', () => {
      const found = allItems.find((i) => i.id === item.id);
      if (found) found.doorCode = doorInput.value;
      updateItem(item.id, { doorCode: doorInput.value });
    });
    doorField.append(doorLabel, doorInput);

    // Notes
    const notesField = document.createElement('div');
    notesField.classList.add('entry-field');
    const notesLabel = document.createElement('label');
    notesLabel.classList.add('entry-label');
    notesLabel.textContent = 'Notes';
    const notesInput = document.createElement('textarea');
    notesInput.value = item.notes || '';
    notesInput.placeholder = 'Notes...';
    notesInput.addEventListener('change', () => {
      const found = allItems.find((i) => i.id === item.id);
      if (found) found.notes = notesInput.value;
      updateItem(item.id, { notes: notesInput.value });
    });
    notesField.append(notesLabel, notesInput);

    entryWrapper.append(addressField, gateField, doorField, notesField);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '×';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => deleteItem(item.id));

    pill.append(entryWrapper, deleteBtn);
    li.appendChild(pill);
    list.appendChild(li);
  });
}

// Helpers
function sortItems(arr) {
  return arr.slice().sort((a, b) => {
    const clean = (str) => (str || '').replace(/^\d+\s*/, '').toLowerCase();
    return clean(a.title).localeCompare(clean(b.title));
  });
}