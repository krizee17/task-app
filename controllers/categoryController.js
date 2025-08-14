const Category = require('../models/Category');
const Task = require('../models/Task');

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(400).json({ error: 'Invalid category ID' });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      isActive: true 
    });
    
    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || '',
      color: color || '#007bff',
      icon: icon || '📁'
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { name, description, color, icon, isActive } = req.body;
    const allowedUpdates = ['name', 'description', 'color', 'icon', 'isActive'];
    const updates = {};

    // Build updates object
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // If name is being updated, check for duplicates
    if (updates.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${updates.name}$`, 'i') },
        isActive: true,
        _id: { $ne: req.params.id }
      });
      
      if (existingCategory) {
        return res.status(400).json({ error: 'Category with this name already exists' });
      }
      updates.name = updates.name.trim();
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(400).json({ error: 'Failed to update category' });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has associated tasks
    const taskCount = await Task.countDocuments({ category: category.name });
    
    if (taskCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category. It has ${taskCount} associated task(s). Please reassign or delete the tasks first.` 
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully', category });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(400).json({ error: 'Invalid category ID' });
  }
};

// Soft delete category (mark as inactive)
const softDeleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deactivated successfully', category });
  } catch (error) {
    console.error('Error deactivating category:', error);
    res.status(400).json({ error: 'Invalid category ID' });
  }
};

// Get categories with task count
const getCategoriesWithTaskCount = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    
    // Get task count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const taskCount = await Task.countDocuments({ category: category.name });
        return {
          ...category.toObject(),
          taskCount
        };
      })
    );

    res.json(categoriesWithCount);
  } catch (error) {
    console.error('Error fetching categories with task count:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Bulk operations
const bulkDeleteCategories = async (req, res) => {
  try {
    const { categoryIds } = req.body;
    
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({ error: 'Category IDs array is required' });
    }

    // Check if any category has associated tasks
    const categories = await Category.find({ _id: { $in: categoryIds } });
    const categoryNames = categories.map(cat => cat.name);
    
    const taskCount = await Task.countDocuments({ category: { $in: categoryNames } });
    
    if (taskCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete categories. They have ${taskCount} associated task(s). Please reassign or delete the tasks first.` 
      });
    }

    const result = await Category.deleteMany({ _id: { $in: categoryIds } });
    
    res.json({ 
      message: `${result.deletedCount} categories deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting categories:', error);
    res.status(500).json({ error: 'Failed to delete categories' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  softDeleteCategory,
  getCategoriesWithTaskCount,
  bulkDeleteCategories
};
