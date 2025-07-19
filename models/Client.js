const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const clientSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4()
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9\s\-&.,()]+$/.test(v);
        },
        message: 'Company name contains invalid characters'
      }
    },
    contactName: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
      maxlength: [100, 'Contact name cannot exceed 100 characters'],
      validate: {
        validator: function (v) {
          return /^[a-zA-Z\s\-.']+$/.test(v);
        },
        message: 'Contact name contains invalid characters'
      }
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      validate: {
        validator: function (v) {
          return /^#[0-9A-Fa-f]{6}$/.test(v);
        },
        message: 'Color must be a valid hex color code'
      }
    },
    timeZone: {
      type: String,
      required: [true, 'Time zone is required'],
      validate: {
        validator: function (v) {
          const moment = require('moment-timezone');
          return moment.tz.names().includes(v);
        },
        message: 'Invalid time zone'
      }
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^\+?[\d\s\-()]{10,}$/.test(v);
        },
        message: 'Invalid phone format'
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

clientSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'clientId'
});

clientSchema.virtual('totalTasks').get(function () {
  return this.projects
    ? this.projects.reduce(
      (total, project) => total + (project.tasks ? project.tasks.length : 0),
      0
    )
    : 0;
});

clientSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

clientSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

clientSchema.index({ companyName: 1 });
clientSchema.index({ isActive: 1 });
clientSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Client', clientSchema);
