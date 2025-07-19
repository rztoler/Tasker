const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const eventSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4()
    },
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      maxlength: [100, 'Event name cannot exceed 100 characters'],
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9\s\-&.,()!?]+$/.test(v);
        },
        message: 'Event name contains invalid characters'
      }
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      validate: {
        validator: function (v) {
          return !v || /^[a-zA-Z0-9\s\-&.,()!?'":\n\r]+$/.test(v);
        },
        message: 'Description contains invalid characters'
      }
    },
    startDateTime: {
      type: Date,
      required: [true, 'Start date and time is required']
    },
    endDateTime: {
      type: Date,
      required: [true, 'End date and time is required'],
      validate: {
        validator: function (v) {
          return v > this.startDateTime;
        },
        message: 'End time must be after start time'
      }
    },
    type: {
      type: String,
      enum: {
        values: ['meeting', 'personal', 'break', 'travel', 'appointment', 'deadline'],
        message: 'Type must be meeting, personal, break, travel, appointment, or deadline'
      },
      default: 'meeting'
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
      validate: {
        validator: function (v) {
          return !v || /^[a-zA-Z0-9\s\-&.,()#]+$/.test(v);
        },
        message: 'Location contains invalid characters'
      }
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurrencePattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      validate: {
        validator: function (v) {
          return !v || this.isRecurring;
        },
        message: 'Recurrence pattern can only be set for recurring events'
      }
    },
    recurrenceEnd: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || (this.isRecurring && v > this.startDateTime);
        },
        message: 'Recurrence end must be after start date for recurring events'
      }
    },
    isAllDay: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^#[0-9A-Fa-f]{6}$/.test(v);
        },
        message: 'Color must be a valid hex color code'
      }
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    attendees: [
      {
        email: {
          type: String,
          validate: {
            validator: function (v) {
              return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Invalid email format'
          }
        },
        name: String,
        status: {
          type: String,
          enum: ['pending', 'accepted', 'declined', 'tentative'],
          default: 'pending'
        }
      }
    ],
    googleEventId: String,
    outlookEventId: String,
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

eventSchema.virtual('duration').get(function () {
  const diffMs = this.endDateTime.getTime() - this.startDateTime.getTime();
  return diffMs / (1000 * 60 * 60);
});

eventSchema.virtual('isUpcoming').get(function () {
  return this.startDateTime > new Date();
});

eventSchema.virtual('isPast').get(function () {
  return this.endDateTime < new Date();
});

eventSchema.virtual('isHappening').get(function () {
  const now = new Date();
  return this.startDateTime <= now && this.endDateTime >= now;
});

eventSchema.virtual('timeZoneDisplay').get(function () {
  return this.startDateTime.toLocaleString();
});

eventSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

eventSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

eventSchema.index({ startDateTime: 1 });
eventSchema.index({ endDateTime: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ isActive: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({
  startDateTime: 1,
  endDateTime: 1
});

module.exports = mongoose.model('Event', eventSchema);
