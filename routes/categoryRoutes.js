const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get categories with task count
router.get('/with-count', categoryController.getCategoriesWithTaskCount);

// Get category by ID
router.get('/:id', categoryController.getCategoryById);

// Create new category
router.post('/', categoryController.createCategory);

// Update category
router.put('/:id', categoryController.updateCategory);

// Delete category
router.delete('/:id', categoryController.deleteCategory);

// Soft delete category (mark as inactive)
router.patch('/:id/deactivate', categoryController.softDeleteCategory);

// Bulk delete categories
router.delete('/bulk/delete', categoryController.bulkDeleteCategories);

module.exports = router;
