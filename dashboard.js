// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const editModal = document.getElementById('editModal');
const viewModal = document.getElementById('viewModal');
const deleteModal = document.getElementById('deleteModal');
const closeModal = document.getElementById('closeModal');
const closeEditModal = document.getElementById('closeEditModal');
const closeViewModal = document.getElementById('closeViewModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const cancelBtn = document.getElementById('cancelBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const addTaskForm = document.getElementById('addTaskForm');
const editTaskForm = document.getElementById('editTaskForm');
const clearAllBtn = document.getElementById('clearAllBtn');
const taskList = document.getElementById('taskList');
const todoList = document.getElementById('todoList');
const inProgressList = document.getElementById('inProgressList');
const completedList = document.getElementById('completedList');

// Global variables
let tasks = [];
let categories = [];
let currentTaskId = null;
let deleteCallback = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadTasks();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Modal controls
    addTaskBtn.addEventListener('click', () => openModal(taskModal));
    closeModal.addEventListener('click', () => closeModalFunc(taskModal));
    closeEditModal.addEventListener('click', () => closeModalFunc(editModal));
    closeViewModal.addEventListener('click', () => closeModalFunc(viewModal));
    closeDeleteModal.addEventListener('click', () => closeModalFunc(deleteModal));
    cancelBtn.addEventListener('click', () => closeModalFunc(taskModal));
    cancelEditBtn.addEventListener('click', () => closeModalFunc(editModal));
    cancelDeleteBtn.addEventListener('click', () => closeModalFunc(deleteModal));
    confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    
    // Form submissions
    addTaskForm.addEventListener('submit', handleAddTask);
    editTaskForm.addEventListener('submit', handleEditTask);
    
    // Clear all tasks
    clearAllBtn.addEventListener('click', handleClearAllTasks);
    
    // Close modals when clicking outside
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) closeModalFunc(taskModal);
    });
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeModalFunc(editModal);
    });
    viewModal.addEventListener('click', (e) => {
        if (e.target === viewModal) closeModalFunc(viewModal);
    });
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeModalFunc(deleteModal);
    });
}

// Modal functions
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModalFunc(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    if (modal === taskModal) {
        addTaskForm.reset();
    } else if (modal === editModal) {
        editTaskForm.reset();
    } else if (modal === deleteModal) {
        deleteCallback = null;
    }
}

// Delete confirmation functions
function showDeleteConfirmation(message, callback) {
    deleteCallback = callback;
    document.getElementById('deleteMessage').textContent = message;
    openModal(deleteModal);
}

async function handleConfirmDelete() {
    if (deleteCallback) {
        await deleteCallback();
        closeModalFunc(deleteModal);
    }
}

// API Functions
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        categories = await response.json();
        updateCategoryDropdowns();
    } catch (error) {
        console.error('Error loading categories:', error);
        // Don't show error notification for categories as it's not critical
    }
}

async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        
        tasks = await response.json();
        renderTasks();
        updateProgressCards();
    } catch (error) {
        console.error('Error loading tasks:', error);
        showNotification('Error loading tasks', 'error');
    }
}

async function addTask(taskData) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) throw new Error('Failed to add task');
        
        const newTask = await response.json();
        tasks.push(newTask);
        renderTasks();
        updateProgressCards();
        showNotification('Task added successfully!', 'success');
        return newTask;
    } catch (error) {
        console.error('Error adding task:', error);
        showNotification('Error adding task', 'error');
        throw error;
    }
}

async function updateTask(taskId, taskData) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) throw new Error('Failed to update task');
        
        const updatedTask = await response.json();
        const index = tasks.findIndex(task => task.id === taskId);
        if (index !== -1) {
            tasks[index] = updatedTask;
        }
        
        renderTasks();
        updateProgressCards();
        showNotification('Task updated successfully!', 'success');
        return updatedTask;
    } catch (error) {
        console.error('Error updating task:', error);
        showNotification('Error updating task', 'error');
        throw error;
    }
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete task');
        
        tasks = tasks.filter(task => task.id !== taskId);
        renderTasks();
        updateProgressCards();
        showNotification('Task deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Error deleting task', 'error');
    }
}

async function clearAllTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to clear tasks');
        
        tasks = [];
        renderTasks();
        updateProgressCards();
        showNotification('All tasks cleared successfully!', 'success');
    } catch (error) {
        console.error('Error clearing tasks:', error);
        showNotification('Error clearing tasks', 'error');
    }
}

// Event handlers
async function handleAddTask(e) {
    e.preventDefault();
    
    const formData = new FormData(addTaskForm);
    const taskData = {
        name: formData.get('taskName'),
        description: formData.get('taskDescription'),
        dueDate: formData.get('dueDate') || null,
        category: formData.get('category') || 'General'
    };
    
    try {
        await addTask(taskData);
        closeModalFunc(taskModal);
        addTaskForm.reset();
    } catch (error) {
        // Error already handled in addTask function
    }
}

async function handleEditTask(e) {
    e.preventDefault();
    
    if (!currentTaskId) return;
    
    const formData = new FormData(editTaskForm);
    const taskData = {
        name: formData.get('taskName'),
        description: formData.get('taskDescription'),
        status: formData.get('status'),
        dueDate: formData.get('dueDate') || null,
        category: formData.get('category') || 'General'
    };
    
    try {
        await updateTask(currentTaskId, taskData);
        closeModalFunc(editModal);
        editTaskForm.reset();
        currentTaskId = null;
    } catch (error) {
        // Error already handled in updateTask function
    }
}

async function handleClearAllTasks() {
    showDeleteConfirmation('Are you sure you want to clear all tasks? This action cannot be undone.', async () => {
        await clearAllTasks();
    });
}

// Render functions
function renderTasks() {
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<li class="task-item empty-state">No tasks found. Add a new task to get started!</li>';
        return;
    }
    
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.taskId = task.id;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `task-${task.id}`;
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => handleTaskToggle(task.id, checkbox.checked));
    
    const label = document.createElement('label');
    label.htmlFor = `task-${task.id}`;
    label.textContent = task.name;
    if (task.completed) {
        label.style.textDecoration = 'line-through';
        label.style.color = 'var(--muted)';
    }
    
    const statusSelect = document.createElement('select');
    statusSelect.className = `status ${task.status}`;
    statusSelect.innerHTML = `
        <option value="to-do" ${task.status === 'to-do' ? 'selected' : ''}>To do</option>
        <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
    `;
    statusSelect.addEventListener('change', (e) => handleStatusChange(task.id, e.target.value));
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';
    
    const viewBtn = document.createElement('button');
    viewBtn.title = 'View';
    viewBtn.innerHTML = '&#128065;';
    viewBtn.addEventListener('click', () => handleViewTask(task));
    
    const editBtn = document.createElement('button');
    editBtn.title = 'Edit';
    editBtn.innerHTML = '&#9998;';
    editBtn.addEventListener('click', () => handleEditTaskClick(task));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.title = 'Delete';
    deleteBtn.innerHTML = '&#128465;';
    deleteBtn.addEventListener('click', () => handleDeleteTask(task.id));
    
    actionsDiv.appendChild(viewBtn);
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    
    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(statusSelect);
    li.appendChild(actionsDiv);
    
    return li;
}

function updateProgressCards() {
    const todoTasks = tasks.filter(task => task.status === 'to-do');
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
    const completedTasks = tasks.filter(task => task.status === 'completed');
    
    todoList.innerHTML = todoTasks.length === 0 ? '<li>No tasks</li>' : 
        todoTasks.map(task => `<li>${task.name}</li>`).join('');
    
    inProgressList.innerHTML = inProgressTasks.length === 0 ? '<li>No tasks</li>' : 
        inProgressTasks.map(task => `<li>${task.name}</li>`).join('');
    
    completedList.innerHTML = completedTasks.length === 0 ? '<li>No tasks</li>' : 
        completedTasks.map(task => `<li>${task.name}</li>`).join('');
}

// Task action handlers
async function handleTaskToggle(taskId, completed) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    try {
        await updateTask(taskId, { completed });
    } catch (error) {
        // Revert checkbox state on error
        const checkbox = document.getElementById(`task-${taskId}`);
        if (checkbox) checkbox.checked = !completed;
    }
}

async function handleStatusChange(taskId, newStatus) {
    try {
        await updateTask(taskId, { status: newStatus });
    } catch (error) {
        // Revert select state on error
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            const select = document.querySelector(`[data-task-id="${taskId}"] .status`);
            if (select) select.value = task.status;
        }
    }
}

function handleViewTask(task) {
    document.getElementById('viewTaskName').textContent = task.name;
    document.getElementById('viewTaskDescription').textContent = task.description;
    document.getElementById('viewTaskStatus').textContent = task.status.replace('-', ' ').toUpperCase();
    document.getElementById('viewTaskCategory').textContent = task.category;
    document.getElementById('viewTaskDueDate').textContent = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
    document.getElementById('viewTaskCreated').textContent = new Date(task.createdAt).toLocaleDateString();
    
    openModal(viewModal);
}

function handleEditTaskClick(task) {
    currentTaskId = task.id;
    
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskName').value = task.name;
    document.getElementById('editTaskDescription').value = task.description;
    document.getElementById('editDueDate').value = task.dueDate || '';
    document.getElementById('editCategory').value = task.category;
    document.getElementById('editStatus').value = task.status;
    
    openModal(editModal);
}

async function handleDeleteTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    const taskName = task ? task.name : 'this task';
    showDeleteConfirmation(`Are you sure you want to delete "${taskName}"?`, async () => {
        await deleteTask(taskId);
    });
}

// Utility functions
function updateCategoryDropdowns() {
    const categorySelect = document.getElementById('category');
    const editCategorySelect = document.getElementById('editCategory');
    
    // Clear existing options except "General"
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="General">General</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
    
    if (editCategorySelect) {
        editCategorySelect.innerHTML = '<option value="General">General</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            editCategorySelect.appendChild(option);
        });
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        color: white;
        font-weight: 600;
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = 'var(--completed)';
            break;
        case 'error':
            notification.style.backgroundColor = 'var(--danger)';
            break;
        default:
            notification.style.backgroundColor = 'var(--primary)';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .task-item.empty-state {
        text-align: center;
        color: var(--muted);
        font-style: italic;
        padding: 2rem;
    }
`;
document.head.appendChild(style); 