const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { validateTask } = require('../middleware/validation');
const { validateInput } = require('../middleware/security');

router.get('/', validateInput, async (req, res, next) => {
  try {
    const { projectId, status, priority, dueDate, page = 1, limit = 50 } = req.query;
    const filter = { isActive: true };

    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (dueDate) {
      const date = new Date(dueDate);
      filter.dueDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    const skip = (page - 1) * limit;
    const tasks = await Task.find(filter)
      .populate({
        path: 'project',
        populate: { path: 'client' }
      })
      .sort({ priority: -1, dueDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: tasks.length,
        totalCount: total
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/overdue', validateInput, async (req, res, next) => {
  try {
    const tasks = await Task.find({
      isActive: true,
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() }
    })
      .populate({
        path: 'project',
        populate: { path: 'client' }
      })
      .sort({ priority: -1, dueDate: 1 });

    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    next(error);
  }
});

router.get('/scheduled', validateInput, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {
      isActive: true,
      scheduledStart: { $exists: true },
      scheduledEnd: { $exists: true }
    };

    if (startDate && endDate) {
      filter.scheduledStart = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const tasks = await Task.find(filter)
      .populate({
        path: 'project',
        populate: { path: 'client' }
      })
      .sort({ scheduledStart: 1 });

    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validateInput, async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, isActive: true }).populate({
      path: 'project',
      populate: { path: 'client' }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateInput, validateTask, async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.body.projectId, isActive: true });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const task = new Task(req.body);
    await task.save();

    await task.populate({
      path: 'project',
      populate: { path: 'client' }
    });

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateInput, validateTask, async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, isActive: true });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    if (task.isLocked) {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify locked task'
      });
    }

    const project = await Project.findOne({ _id: req.body.projectId, isActive: true });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const updatedTask = await Task.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'project',
      populate: { path: 'client' }
    });

    res.json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/schedule', validateInput, async (req, res, next) => {
  try {
    const { scheduledStart, scheduledEnd } = req.body;

    if (!scheduledStart || !scheduledEnd) {
      return res.status(400).json({
        success: false,
        error: 'Both scheduledStart and scheduledEnd are required'
      });
    }

    const startDate = new Date(scheduledStart);
    const endDate = new Date(scheduledEnd);

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        error: 'Scheduled end must be after start'
      });
    }

    const task = await Task.findOne({ _id: req.params.id, isActive: true });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    if (task.isLocked) {
      return res.status(400).json({
        success: false,
        error: 'Cannot schedule locked task'
      });
    }

    if (startDate > task.dueDate) {
      return res.status(400).json({
        success: false,
        error: 'Cannot schedule task after due date'
      });
    }

    const conflictingTasks = await Task.find({
      _id: { $ne: req.params.id },
      isActive: true,
      scheduledStart: { $exists: true },
      scheduledEnd: { $exists: true },
      $or: [
        {
          scheduledStart: { $lt: endDate },
          scheduledEnd: { $gt: startDate }
        }
      ]
    });

    if (conflictingTasks.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Time slot conflicts with existing scheduled tasks',
        conflicts: conflictingTasks.map(t => ({
          id: t._id,
          name: t.name,
          scheduledStart: t.scheduledStart,
          scheduledEnd: t.scheduledEnd
        }))
      });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id },
      { scheduledStart: startDate, scheduledEnd: endDate },
      { new: true, runValidators: true }
    ).populate({
      path: 'project',
      populate: { path: 'client' }
    });

    res.json({
      success: true,
      data: updatedTask,
      message: 'Task scheduled successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/complete', validateInput, async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, isActive: true });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    if (task.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Task is already completed'
      });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id },
      {
        status: 'completed',
        completedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate({
      path: 'project',
      populate: { path: 'client' }
    });

    res.json({
      success: true,
      data: updatedTask,
      message: 'Task marked as completed'
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', validateInput, async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, isActive: true });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    if (task.isLocked) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete locked task'
      });
    }

    await Task.findOneAndUpdate({ _id: req.params.id }, { isActive: false }, { new: true });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
