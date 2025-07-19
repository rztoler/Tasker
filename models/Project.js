const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const projectSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4()
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9\s\-&.,()]+$/.test(v);
        },
        message: 'Project name contains invalid characters'
      }
    },
    clientId: {
      type: String,
      required: [true, 'Client ID is required'],
      ref: 'Client',
      validate: {
        validator: function (v) {
          return /^[0-9a-fA-F-]{36}$/.test(v);
        },
        message: 'Invalid client ID format'
      }
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      validate: {
        validator: function (v) {
          return !v || /^[a-zA-Z0-9\s\-&.,()!?'"]+$/.test(v);
        },
        message: 'Description contains invalid characters'
      }
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'completed', 'on-hold'],
        message: 'Status must be active, completed, or on-hold'
      },
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || !this.startDate || v >= this.startDate;
        },
        message: 'End date must be after start date'
      }
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
  },
  {
    _id: false,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

projectSchema.virtual('client', {
  ref: 'Client',
  localField: 'clientId',
  foreignField: '_id',
  justOne: true
});

projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId'
});

projectSchema.virtual('taskCount').get(function () {
  return this.tasks ? this.tasks.length : 0;
});

projectSchema.virtual('completedTaskCount').get(function () {
  return this.tasks ? this.tasks.filter(task => task.status === 'completed').length : 0;
});

projectSchema.virtual('progress').get(function () {
  if (!this.tasks || this.tasks.length === 0) return 0;
  return Math.round((this.completedTaskCount / this.taskCount) * 100);
});

projectSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

projectSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

projectSchema.index({ clientId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ isActive: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Project', projectSchema);
