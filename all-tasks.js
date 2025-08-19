// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

const allTasksTbody = document.getElementById('allTasksTbody');
const allTasksEmpty = document.getElementById('allTasksEmpty');
const filterStatus = document.getElementById('filterStatus');
const filterDate = document.getElementById('filterDate');
const clearFilters = document.getElementById('clearFilters');
const addTaskBtn = document.getElementById('addTaskBtn');

// Modals and controls (reuse dashboard modal UX)
const viewModal = document.getElementById('viewModal');
const deleteModal = document.getElementById('deleteModal');
const closeViewModal = document.getElementById('closeViewModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

let allTasks = [];
let deleteCallback = null;

// Fetch all tasks on page load
window.addEventListener('DOMContentLoaded', () => {
  loadAllTasks();
  filterStatus.addEventListener('change', renderFilteredTasks);
  filterDate.addEventListener('change', renderFilteredTasks);
  clearFilters.addEventListener('click', clearAllFilters);
  addTaskBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html'; // Reuse dashboard modal or redirect to dashboard for adding
  });

  // Modal listeners
  if (closeViewModal) closeViewModal.addEventListener('click', () => closeModalFunc(viewModal));
  if (closeDeleteModal) closeDeleteModal.addEventListener('click', () => closeModalFunc(deleteModal));
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => closeModalFunc(deleteModal));
  if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

  // Click outside to close
  if (viewModal) viewModal.addEventListener('click', (e) => { if (e.target === viewModal) closeModalFunc(viewModal); });
  if (deleteModal) deleteModal.addEventListener('click', (e) => { if (e.target === deleteModal) closeModalFunc(deleteModal); });

  // Sidebar toggle
  const menuBtn = document.querySelector('.menu-btn');
  const sidebar = document.querySelector('.sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }
});

// Modal helpers
function openModal(modal) {
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModalFunc(modal) {
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
  if (modal === deleteModal) {
    deleteCallback = null;
  }
}

function showDeleteConfirmation(message, callback) {
  deleteCallback = callback;
  const messageEl = document.getElementById('deleteMessage');
  if (messageEl) messageEl.textContent = message;
  openModal(deleteModal);
}

async function handleConfirmDelete() {
  if (typeof deleteCallback === 'function') {
    await deleteCallback();
    closeModalFunc(deleteModal);
  }
}

async function loadAllTasks() {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    allTasks = await response.json();
    renderFilteredTasks();
  } catch (error) {
    allTasksTbody.innerHTML = '';
    allTasksEmpty.style.display = 'block';
    allTasksEmpty.textContent = 'Error loading tasks.';
  }
}

function renderFilteredTasks() {
  let filtered = [...allTasks];
  const status = filterStatus.value;
  const date = filterDate.value;

  if (status !== 'all') {
    filtered = filtered.filter(task => task.status === status);
  }
  if (date) {
    filtered = filtered.filter(task => (task.dueDate && task.dueDate.startsWith(date)) || (task.scheduledOn && task.scheduledOn.startsWith(date)));
  }

  renderTasksTable(filtered);
}

function clearAllFilters() {
  filterStatus.value = 'all';
  filterDate.value = '';
  renderFilteredTasks();
}

function renderTasksTable(tasks) {
  allTasksTbody.innerHTML = '';
  if (!tasks.length) {
    allTasksEmpty.style.display = 'block';
    return;
  }
  allTasksEmpty.style.display = 'none';
  tasks.forEach(task => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(task.name)}</td>
      <td>${task.dueDate ? formatDate(task.dueDate) : '-'}</td>
      <td>${task.scheduledOn ? formatDate(task.scheduledOn) : '-'}</td>
      <td><span class="all-tasks-status ${task.status}">${formatStatus(task.status)}</span></td>
      <td>
        <div class="task-actions">
          <button title="View" onclick="viewTask('${task.id}')">&#128065;</button>
          <button title="Edit" onclick="editTask('${task.id}')">&#9998;</button>
          <button title="Delete" onclick="deleteTask('${task.id}')">&#128465;</button>
        </div>
      </td>
    `;
    allTasksTbody.appendChild(tr);
  });
}

function formatStatus(status) {
  if (status === 'to-do') return 'To do';
  if (status === 'in-progress') return 'In Progress';
  if (status === 'completed') return 'Completed';
  return status;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// View, Edit, Delete handlers using dashboard-style modals
window.viewTask = function(id) {
  const task = allTasks.find(t => t.id === id);
  if (!task) return;

  const nameEl = document.getElementById('viewTaskName');
  const descEl = document.getElementById('viewTaskDescription');
  const statusEl = document.getElementById('viewTaskStatus');
  const categoryEl = document.getElementById('viewTaskCategory');
  const dueEl = document.getElementById('viewTaskDueDate');
  const createdEl = document.getElementById('viewTaskCreated');

  if (nameEl) nameEl.textContent = task.name || '';
  if (descEl) descEl.textContent = task.description || '';
  if (statusEl) statusEl.textContent = formatStatus(task.status || '');
  if (categoryEl) categoryEl.textContent = task.category || 'General';
  if (dueEl) dueEl.textContent = task.dueDate ? formatDate(task.dueDate) : 'No due date';
  if (createdEl) createdEl.textContent = task.createdAt ? formatDate(task.createdAt) : (task.scheduledOn ? formatDate(task.scheduledOn) : '-');

  openModal(viewModal);
};

window.editTask = function(id) {
  window.location.href = 'dashboard.html'; // Or open modal if shared
};

window.deleteTask = function(id) {
  const task = allTasks.find(t => t.id === id);
  const taskName = task ? task.name : 'this task';
  showDeleteConfirmation(`Are you sure you want to delete "${taskName}"?`, async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete task');
      allTasks = allTasks.filter(t => t.id !== id);
      renderFilteredTasks();
    } catch (error) {
      // Fallback alert for error
      alert('Error deleting task.');
    }
  });
};