// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

const allTasksTbody = document.getElementById('allTasksTbody');
const allTasksEmpty = document.getElementById('allTasksEmpty');
const filterStatus = document.getElementById('filterStatus');
const filterDate = document.getElementById('filterDate');
const clearFilters = document.getElementById('clearFilters');
const addTaskBtn = document.getElementById('addTaskBtn');

let allTasks = [];

// Fetch all tasks on page load
window.addEventListener('DOMContentLoaded', () => {
  loadAllTasks();
  filterStatus.addEventListener('change', renderFilteredTasks);
  filterDate.addEventListener('change', renderFilteredTasks);
  clearFilters.addEventListener('click', clearAllFilters);
  addTaskBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html'; // Reuse dashboard modal or redirect to dashboard for adding
  });
});

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

// View, Edit, Delete handlers (simple alert for now, can be replaced with modals)
window.viewTask = function(id) {
  const task = allTasks.find(t => t.id === id);
  if (task) alert(`Task: ${task.name}\nDescription: ${task.description || ''}\nDue: ${task.dueDate || '-'}\nStatus: ${formatStatus(task.status)}`);
};

window.editTask = function(id) {
  window.location.href = 'dashboard.html'; // Or open modal if shared
};

window.deleteTask = async function(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete task');
    allTasks = allTasks.filter(t => t.id !== id);
    renderFilteredTasks();
  } catch (error) {
    alert('Error deleting task.');
  }
};