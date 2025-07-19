const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Project = require('../models/Project');
const { validateClient } = require('../middleware/validation');
const { validateInput } = require('../middleware/security');

router.get('/', validateInput, async (req, res, next) => {
  try {
    const clients = await Client.find({ isActive: true })
      .populate({
        path: 'projects',
        match: { isActive: true },
        populate: {
          path: 'tasks',
          match: { isActive: true }
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: clients,
      count: clients.length
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validateInput, async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, isActive: true })
      .populate({
        path: 'projects',
        match: { isActive: true },
        populate: {
          path: 'tasks',
          match: { isActive: true }
        }
      });

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateInput, validateClient, async (req, res, next) => {
  try {
    const existingClient = await Client.findOne({
      companyName: req.body.companyName,
      isActive: true
    });

    if (existingClient) {
      return res.status(409).json({
        success: false,
        error: 'Client with this company name already exists'
      });
    }

    const client = new Client(req.body);
    await client.save();

    res.status(201).json({
      success: true,
      data: client,
      message: 'Client created successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateInput, validateClient, async (req, res, next) => {
  try {
    const existingClient = await Client.findOne({
      companyName: req.body.companyName,
      isActive: true,
      _id: { $ne: req.params.id }
    });

    if (existingClient) {
      return res.status(409).json({
        success: false,
        error: 'Client with this company name already exists'
      });
    }

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      req.body,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: client,
      message: 'Client updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', validateInput, async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, isActive: true });

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    const activeProjects = await Project.countDocuments({
      clientId: req.params.id,
      isActive: true,
      status: 'active'
    });

    if (activeProjects > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete client with active projects'
      });
    }

    await Client.findOneAndUpdate(
      { _id: req.params.id },
      { isActive: false },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/dashboard', validateInput, async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, isActive: true })
      .populate({
        path: 'projects',
        match: { isActive: true },
        populate: {
          path: 'tasks',
          match: { isActive: true }
        }
      });

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    const projects = client.projects || [];
    const allTasks = projects.flatMap(project => project.tasks || []);
    
    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalTasks: allTasks.length,
      pendingTasks: allTasks.filter(t => t.status === 'pending').length,
      inProgressTasks: allTasks.filter(t => t.status === 'in-progress').length,
      completedTasks: allTasks.filter(t => t.status === 'completed').length,
      overdueTasks: allTasks.filter(t => t.isOverdue).length,
      highPriorityTasks: allTasks.filter(t => t.priority >= 4).length
    };

    res.json({
      success: true,
      data: {
        client,
        projects,
        stats,
        upcomingTasks: allTasks
          .filter(t => t.status !== 'completed')
          .sort((a, b) => a.dueDate - b.dueDate)
          .slice(0, 10)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;