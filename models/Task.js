const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Task name is required'],
      trim: true,
      maxlength: [100, 'Task name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
      maxlength: [500, 'Task description cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['to-do', 'in-progress', 'completed'],
        message: 'Status must be either to-do, in-progress, or completed'
      },
      default: 'to-do'
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow null/undefined
          return v >= new Date(new Date().setHours(0, 0, 0, 0));
        },
        message: 'Due date cannot be in the past'
      }
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be either low, medium, or high'
      },
      default: 'medium'
    },
    tags: [{
      type: String,
      trim: true
    }],
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      }
    }
  }
);

// Virtual for formatted due date
taskSchema.virtual('dueDateFormatted').get(function() {
  if (!this.dueDate) return null;
  return this.dueDate.toISOString().split('T')[0];
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.completed) return false;
  return new Date() > this.dueDate;
});

// Indexes for better query performance
taskSchema.index({ status: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ completed: 1 });
taskSchema.index({ createdAt: -1 });

// Pre-save middleware to update completed status based on status field
taskSchema.pre('save', function(next) {
  if (this.status === 'completed') {
    this.completed = true;
  } else {
    this.completed = false;
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
