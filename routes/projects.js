const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const Client = require('../models/Client');
const { validateProject } = require('../middleware/validation');
const { validateInput } = require('../middleware/security');

router.get('/', validateInput, async (req, res, next) => {
  try {
    const { clientId, status } = req.query;
    const filter = { isActive: true };
    
    if (clientId) filter.clientId = clientId;
    if (status) filter.status = status;

    const projects = await Project.find(filter)
      .populate('client')
      .populate({
        path: 'tasks',
        match: { isActive: true }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: projects,
      count: projects.length
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validateInput, async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, isActive: true })
      .populate('client')
      .populate({
        path: 'tasks',
        match: { isActive: true }
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateInput, validateProject, async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.body.clientId, isActive: true });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    const existingProject = await Project.findOne({
      name: req.body.name,
      clientId: req.body.clientId,
      isActive: true
    });

    if (existingProject) {
      return res.status(409).json({
        success: false,
        error: 'Project with this name already exists for this client'
      });
    }

    const project = new Project(req.body);
    await project.save();

    await project.populate('client');

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateInput, validateProject, async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.body.clientId, isActive: true });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    const existingProject = await Project.findOne({
      name: req.body.name,
      clientId: req.body.clientId,
      isActive: true,
      _id: { $ne: req.params.id }
    });

    if (existingProject) {
      return res.status(409).json({
        success: false,
        error: 'Project with this name already exists for this client'
      });
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      req.body,
      { new: true, runValidators: true }
    ).populate('client');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project,
      message: 'Project updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', validateInput, async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, isActive: true });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const activeTasks = await Task.countDocuments({
      projectId: req.params.id,
      isActive: true,
      status: { $in: ['pending', 'in-progress'] }
    });

    if (activeTasks > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete project with active tasks'
      });
    }

    await Project.findOneAndUpdate(
      { _id: req.params.id },
      { isActive: false },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/stats', validateInput, async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, isActive: true })
      .populate({
        path: 'tasks',
        match: { isActive: true }
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const tasks = project.tasks || [];
    const now = new Date();
    
    const stats = {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      overdueTasks: tasks.filter(t => t.isOverdue).length,
      scheduledTasks: tasks.filter(t => t.isScheduled).length,
      highPriorityTasks: tasks.filter(t => t.priority >= 4).length,
      totalEstimatedHours: tasks.reduce((sum, t) => sum + t.duration, 0),
      completedHours: tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.duration, 0),
      remainingHours: tasks.filter(t => t.status !== 'completed').reduce((sum, t) => sum + t.duration, 0),
      averagePriority: tasks.length > 0 ? (tasks.reduce((sum, t) => sum + t.priority, 0) / tasks.length).toFixed(1) : 0,
      upcomingDeadlines: tasks
        .filter(t => t.status !== 'completed' && t.dueDate > now)
        .sort((a, b) => a.dueDate - b.dueDate)
        .slice(0, 5)
        .map(t => ({
          id: t._id,
          name: t.name,
          dueDate: t.dueDate,
          priority: t.priority,
          daysUntilDue: t.daysUntilDue
        }))
    };

    stats.completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

    res.json({
      success: true,
      data: {
        project: {
          id: project._id,
          name: project.name,
          status: project.status
        },
        stats
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;