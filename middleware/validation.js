const Joi = require('joi');
const moment = require('moment-timezone');

const clientSchema = Joi.object({
  companyName: Joi.string().trim().min(1).max(100).required(),
  contactName: Joi.string().trim().min(1).max(100).required(),
  color: Joi.string().regex(/^#[0-9A-Fa-f]{6}$/).required(),
  timeZone: Joi.string().valid(...moment.tz.names()).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional()
});

const projectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  clientId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  description: Joi.string().trim().max(500).optional(),
  status: Joi.string().valid('active', 'completed', 'on-hold').default('active')
});

const taskSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  projectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  dueDate: Joi.date().min('now').required(),
  duration: Joi.number().min(0.25).max(24).required(),
  priority: Joi.number().integer().min(1).max(5).required(),
  description: Joi.string().trim().max(1000).optional(),
  status: Joi.string().valid('pending', 'in-progress', 'completed', 'archived').default('pending'),
  scheduledStart: Joi.date().optional(),
  scheduledEnd: Joi.date().optional()
});

const eventSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  date: Joi.date().required(),
  startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  description: Joi.string().trim().max(500).optional(),
  type: Joi.string().valid('meeting', 'personal', 'break', 'travel').default('meeting')
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    req.body = value;
    next();
  };
};

const validateTimeRange = (req, res, next) => {
  if (req.body.startTime && req.body.endTime) {
    const start = moment(req.body.startTime, 'HH:mm');
    const end = moment(req.body.endTime, 'HH:mm');
    
    if (end.isSameOrBefore(start)) {
      return res.status(400).json({
        error: 'End time must be after start time'
      });
    }
  }
  next();
};

const validateTaskScheduling = (req, res, next) => {
  if (req.body.scheduledStart && req.body.scheduledEnd) {
    const start = moment(req.body.scheduledStart);
    const end = moment(req.body.scheduledEnd);
    const dueDate = moment(req.body.dueDate);
    
    if (end.isSameOrBefore(start)) {
      return res.status(400).json({
        error: 'Scheduled end time must be after start time'
      });
    }
    
    if (start.isAfter(dueDate)) {
      return res.status(400).json({
        error: 'Task cannot be scheduled after due date'
      });
    }
  }
  next();
};

module.exports = {
  validateClient: validateRequest(clientSchema),
  validateProject: validateRequest(projectSchema),
  validateTask: [validateRequest(taskSchema), validateTaskScheduling],
  validateEvent: [validateRequest(eventSchema), validateTimeRange],
  clientSchema,
  projectSchema,
  taskSchema,
  eventSchema
};