const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const taskSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4()
  },
  name: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true,
    maxlength: [100, 'Task name cannot exceed 100 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9\s\-&.,()!?]+$/.test(v);
      },
      message: 'Task name contains invalid characters'
    }
  },
  projectId: {
    type: String,
    required: [true, 'Project ID is required'],
    ref: 'Project',
    validate: {
      validator: function(v) {
        return /^[0-9a-fA-F-]{36}$/.test(v);
      },
      message: 'Invalid project ID format'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    validate: {
      validator: function(v) {
        return !v || /^[a-zA-Z0-9\s\-&.,()!?'":\n\r]+$/.test(v);
      },
      message: 'Description contains invalid characters'
    }
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(v) {
        return v >= new Date();
      },
      message: 'Due date cannot be in the past'
    }
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [0.25, 'Duration must be at least 15 minutes (0.25 hours)'],
    max: [24, 'Duration cannot exceed 24 hours'],
    validate: {
      validator: function(v) {
        return v % 0.25 === 0;
      },
      message: 'Duration must be in 15-minute increments'
    }
  },
  priority: {
    type: Number,
    required: [true, 'Priority is required'],
    min: [1, 'Priority must be between 1 and 5'],
    max: [5, 'Priority must be between 1 and 5'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'Priority must be an integer'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in-progress', 'completed', 'archived'],
      message: 'Status must be pending, in-progress, completed, or archived'
    },
    default: 'pending'
  },
  scheduledStart: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || !this.dueDate || v <= this.dueDate;
      },
      message: 'Scheduled start cannot be after due date'
    }
  },
  scheduledEnd: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || !this.scheduledStart || v > this.scheduledStart;
      },
      message: 'Scheduled end must be after scheduled start'
    }
  },
  completedAt: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || this.status === 'completed';
      },
      message: 'Completed date can only be set when status is completed'
    }
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

taskSchema.virtual('project', {
  ref: 'Project',
  localField: 'projectId',
  foreignField: '_id',
  justOne: true
});

taskSchema.virtual('client', {
  ref: 'Client',
  localField: 'project.clientId',
  foreignField: '_id',
  justOne: true
});

taskSchema.virtual('isOverdue').get(function() {
  return this.status !== 'completed' && new Date() > this.dueDate;
});

taskSchema.virtual('daysUntilDue').get(function() {
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

taskSchema.virtual('isScheduled').get(function() {
  return !!(this.scheduledStart && this.scheduledEnd);
});

taskSchema.virtual('urgencyScore').get(function() {
  const daysLeft = this.daysUntilDue;
  const priorityWeight = this.priority * 2;
  const timeWeight = Math.max(1, 10 - daysLeft);
  return priorityWeight + timeWeight;
});

taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  if (this.status === 'completed' && this.dueDate < new Date()) {
    this.isLocked = true;
  }
  
  next();
});

taskSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

taskSchema.index({ projectId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: -1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ scheduledStart: 1 });
taskSchema.index({ isActive: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Task', taskSchema);