const Task = require('../models/Task');
const Category = require('../models/Category');

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(400).json({ error: 'Invalid task ID' });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const { name, description, dueDate, category } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ error: 'Task name and description are required' });
    }

    // Validate category if provided
    if (category && category !== 'General') {
      const categoryExists = await Category.findOne({ 
        name: category, 
        isActive: true 
      });
      
      if (!categoryExists) {
        return res.status(400).json({ error: 'Invalid category selected' });
      }
    }

    const task = await Task.create({
      name: name.trim(),
      description: description.trim(),
      status: 'to-do',
      dueDate: dueDate || null,
      category: category || 'General',
      completed: false,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'description', 'status', 'dueDate', 'category', 'completed'];
    const updates = {};

    // Build updates object
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Validate category if being updated
    if (updates.category && updates.category !== 'General') {
      const categoryExists = await Category.findOne({ 
        name: updates.category, 
        isActive: true 
      });
      
      if (!categoryExists) {
        return res.status(400).json({ error: 'Invalid category selected' });
      }
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(400).json({ error: 'Failed to update task' });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully', task });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(400).json({ error: 'Invalid task ID' });
  }
};

// Clear all tasks
const clearAllTasks = async (req, res) => {
  try {
    await Task.deleteMany({});
    res.json({ message: 'All tasks cleared successfully' });
  } catch (error) {
    console.error('Error clearing tasks:', error);
    res.status(500).json({ error: 'Failed to clear tasks' });
  }
};

// Get tasks by status
const getTasksByStatus = async (req, res) => {
  try {
    const status = req.params.status;
    const validStatuses = ['to-do', 'in-progress', 'completed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const tasks = await Task.find({ status }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks by status:', error);
    res.status(500).json({ error: 'Failed to fetch tasks by status' });
  }
};

// Get today's tasks
const getTodayTasks = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const tasks = await Task.find({
      $or: [
        { dueDate: null },
        { dueDate: today },
      ],
    }).sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching today\'s tasks:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s tasks' });
  }
};

// Get tasks by category
const getTasksByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    
    // Validate category exists
    if (category !== 'General') {
      const categoryExists = await Category.findOne({ 
        name: category, 
        isActive: true 
      });
      
      if (!categoryExists) {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    const tasks = await Task.find({ category }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks by category:', error);
    res.status(500).json({ error: 'Failed to fetch tasks by category' });
  }
};

// Bulk operations
const bulkUpdateTasks = async (req, res) => {
  try {
    const { taskIds, updates } = req.body;
    
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ error: 'Task IDs array is required' });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Updates object is required' });
    }

    const allowedUpdates = ['status', 'category', 'completed'];
    const validUpdates = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        validUpdates[key] = updates[key];
      }
    }

    // Validate category if being updated
    if (validUpdates.category && validUpdates.category !== 'General') {
      const categoryExists = await Category.findOne({ 
        name: validUpdates.category, 
        isActive: true 
      });
      
      if (!categoryExists) {
        return res.status(400).json({ error: 'Invalid category selected' });
      }
    }

    const result = await Task.updateMany(
      { _id: { $in: taskIds } },
      { $set: validUpdates }
    );

    res.json({ 
      message: `${result.modifiedCount} tasks updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating tasks:', error);
    res.status(500).json({ error: 'Failed to update tasks' });
  }
};

const bulkDeleteTasks = async (req, res) => {
  try {
    const { taskIds } = req.body;
    
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ error: 'Task IDs array is required' });
    }

    const result = await Task.deleteMany({ _id: { $in: taskIds } });
    
    res.json({ 
      message: `${result.deletedCount} tasks deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting tasks:', error);
    res.status(500).json({ error: 'Failed to delete tasks' });
  }
};

// Search tasks
const searchTasks = async (req, res) => {
  try {
    const { q, status, category, dueDate } = req.query;
    
    const searchQuery = {};

    // Text search
    if (q) {
      searchQuery.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // Status filter
    if (status) {
      searchQuery.status = status;
    }

    // Category filter
    if (category) {
      searchQuery.category = category;
    }

    // Due date filter
    if (dueDate) {
      searchQuery.dueDate = dueDate;
    }

    const tasks = await Task.find(searchQuery).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error searching tasks:', error);
    res.status(500).json({ error: 'Failed to search tasks' });
  }
};

// Get task statistics
const getTaskStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const inProgressTasks = await Task.countDocuments({ status: 'in-progress' });
    const todoTasks = await Task.countDocuments({ status: 'to-do' });
    
    // Get category-wise task counts
    const categoryStats = await Task.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const stats = {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      todo: todoTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      categoryStats
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching task statistics:', error);
    res.status(500).json({ error: 'Failed to fetch task statistics' });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  clearAllTasks,
  getTasksByStatus,
  getTodayTasks,
  getTasksByCategory,
  bulkUpdateTasks,
  bulkDeleteTasks,
  searchTasks,
  getTaskStats
};
