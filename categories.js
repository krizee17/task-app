// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const categoriesGrid = document.getElementById('categoriesGrid');
const emptyState = document.getElementById('emptyState');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const addFirstCategoryBtn = document.getElementById('addFirstCategoryBtn');
const categoryModal = document.getElementById('categoryModal');
const deleteModal = document.getElementById('deleteModal');
const categoryForm = document.getElementById('categoryForm');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const cancelBtn = document.getElementById('cancelBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const deleteMessage = document.getElementById('deleteMessage');

// Form elements
const categoryName = document.getElementById('categoryName');
const categoryDescription = document.getElementById('categoryDescription');
const categoryColor = document.getElementById('categoryColor');
const colorValue = document.getElementById('colorValue');
const categoryIcon = document.getElementById('categoryIcon');
const iconPicker = document.getElementById('iconPicker');

// Global variables
let categories = [];
let currentCategoryId = null;
let deleteCallback = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Modal controls
    addCategoryBtn.addEventListener('click', () => openAddModal());
    addFirstCategoryBtn.addEventListener('click', () => openAddModal());
    closeModal.addEventListener('click', () => closeModalFunc(categoryModal));
    closeDeleteModal.addEventListener('click', () => closeModalFunc(deleteModal));
    cancelBtn.addEventListener('click', () => closeModalFunc(categoryModal));
    cancelDeleteBtn.addEventListener('click', () => closeModalFunc(deleteModal));
    confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    
    // Form submission
    categoryForm.addEventListener('submit', handleSubmitCategory);
    
    // Color picker
    categoryColor.addEventListener('input', (e) => {
        colorValue.textContent = e.target.value;
    });
    
    // Icon picker
    iconPicker.addEventListener('click', (e) => {
        if (e.target.classList.contains('icon-option')) {
            // Remove selected class from all options
            document.querySelectorAll('.icon-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            e.target.classList.add('selected');
            categoryIcon.value = e.target.dataset.icon;
        }
    });
    
    // Close modals when clicking outside
    categoryModal.addEventListener('click', (e) => {
        if (e.target === categoryModal) closeModalFunc(categoryModal);
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
    if (modal === categoryModal) {
        categoryForm.reset();
        currentCategoryId = null;
        modalTitle.textContent = 'Add Category';
        // Reset icon selection
        document.querySelectorAll('.icon-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector('[data-icon="📁"]').classList.add('selected');
        categoryColor.value = '#007bff';
        colorValue.textContent = '#007bff';
    } else if (modal === deleteModal) {
        deleteCallback = null;
    }
}

function openAddModal() {
    modalTitle.textContent = 'Add Category';
    currentCategoryId = null;
    categoryForm.reset();
    // Reset icon selection
    document.querySelectorAll('.icon-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector('[data-icon="📁"]').classList.add('selected');
    categoryColor.value = '#007bff';
    colorValue.textContent = '#007bff';
    openModal(categoryModal);
}

function openEditModal(category) {
    modalTitle.textContent = 'Edit Category';
    currentCategoryId = category.id;
    
    // Populate form
    categoryName.value = category.name;
    categoryDescription.value = category.description || '';
    categoryColor.value = category.color || '#007bff';
    colorValue.textContent = category.color || '#007bff';
    categoryIcon.value = category.icon || '📁';
    
    // Set icon selection
    document.querySelectorAll('.icon-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[data-icon="${category.icon || '📁'}"]`).classList.add('selected');
    
    openModal(categoryModal);
}

// Delete confirmation functions
function showDeleteConfirmation(message, callback) {
    deleteCallback = callback;
    deleteMessage.textContent = message;
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
        const response = await fetch(`${API_BASE_URL}/categories/with-count`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        categories = await response.json();
        renderCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
        showNotification('Error loading categories', 'error');
    }
}

async function createCategory(categoryData) {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create category');
        }
        
        const newCategory = await response.json();
        categories.push(newCategory);
        renderCategories();
        showNotification('Category created successfully!', 'success');
        return newCategory;
    } catch (error) {
        console.error('Error creating category:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

async function updateCategory(categoryId, categoryData) {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update category');
        }
        
        const updatedCategory = await response.json();
        const index = categories.findIndex(cat => cat.id === categoryId);
        if (index !== -1) {
            categories[index] = updatedCategory;
        }
        
        renderCategories();
        showNotification('Category updated successfully!', 'success');
        return updatedCategory;
    } catch (error) {
        console.error('Error updating category:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

async function deleteCategory(categoryId) {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete category');
        }
        
        categories = categories.filter(cat => cat.id !== categoryId);
        renderCategories();
        showNotification('Category deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting category:', error);
        showNotification(error.message, 'error');
    }
}

// Event handlers
async function handleSubmitCategory(e) {
    e.preventDefault();
    
    const formData = new FormData(categoryForm);
    const categoryData = {
        name: formData.get('name').trim(),
        description: formData.get('description').trim(),
        color: formData.get('color'),
        icon: formData.get('icon')
    };
    
    try {
        if (currentCategoryId) {
            await updateCategory(currentCategoryId, categoryData);
        } else {
            await createCategory(categoryData);
        }
        closeModalFunc(categoryModal);
    } catch (error) {
        // Error already handled in create/update functions
    }
}

async function handleDeleteCategory(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    const categoryName = category ? category.name : 'this category';
    
    showDeleteConfirmation(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`, async () => {
        await deleteCategory(categoryId);
    });
}

// Render functions
function renderCategories() {
    if (categories.length === 0) {
        categoriesGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    categoriesGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    categoriesGrid.innerHTML = categories.map(category => `
        <div class="category-card" style="border-left-color: ${category.color}">
            <div class="category-header">
                <span class="category-icon">${category.icon}</span>
                <span class="category-name">${escapeHtml(category.name)}</span>
                <div class="category-color" style="background-color: ${category.color}"></div>
            </div>
            ${category.description ? `<div class="category-description">${escapeHtml(category.description)}</div>` : ''}
            <div class="category-stats">
                <span class="task-count">${category.taskCount || 0} tasks</span>
                <div class="category-actions">
                    <button class="btn-edit" onclick="handleEditCategory('${category.id}')">Edit</button>
                    <button class="btn-delete" onclick="handleDeleteCategory('${category.id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Global functions for onclick handlers
window.handleEditCategory = function(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
        openEditModal(category);
    }
};

window.handleDeleteCategory = function(categoryId) {
    handleDeleteCategory(categoryId);
};

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
`;
document.head.appendChild(style);
