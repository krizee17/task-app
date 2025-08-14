const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Get all tasks
router.get('/', taskController.getAllTasks);

// Get task statistics
router.get('/stats', taskController.getTaskStats);

// Search tasks
router.get('/search', taskController.searchTasks);

// Get today's tasks
router.get('/today', taskController.getTodayTasks);

// Get tasks by status
router.get('/status/:status', taskController.getTasksByStatus);

// Get tasks by category
router.get('/category/:category', taskController.getTasksByCategory);

// Get task by ID
router.get('/:id', taskController.getTaskById);

// Create new task
router.post('/', taskController.createTask);

// Update task
router.put('/:id', taskController.updateTask);

// Delete task
router.delete('/:id', taskController.deleteTask);

// Clear all tasks
router.delete('/', taskController.clearAllTasks);

// Bulk operations
router.put('/bulk/update', taskController.bulkUpdateTasks);
router.delete('/bulk/delete', taskController.bulkDeleteTasks);

module.exports = router;
