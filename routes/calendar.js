const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Event = require('../models/Event');
const { validateInput } = require('../middleware/security');

router.get('/view', validateInput, async (req, res, next) => {
  try {
    const { startDate, endDate, view = 'week' } = req.query;
    
    let start, end;
    const now = new Date();
    
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      switch (view) {
        case 'day':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(start);
          end.setDate(start.getDate() + 1);
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          break;
        default: // week
          const dayOfWeek = now.getDay();
          start = new Date(now);
          start.setDate(now.getDate() - dayOfWeek);
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
      }
    }

    const [scheduledTasks, events] = await Promise.all([
      Task.find({
        isActive: true,
        scheduledStart: { $exists: true },
        scheduledEnd: { $exists: true },
        scheduledStart: { $gte: start, $lte: end }
      })
      .populate({
        path: 'project',
        populate: { path: 'client' }
      })
      .sort({ scheduledStart: 1 }),
      
      Event.find({
        isActive: true,
        startDateTime: { $gte: start, $lte: end }
      })
      .sort({ startDateTime: 1 })
    ]);

    const calendarItems = [
      ...scheduledTasks.map(task => ({
        id: task._id,
        type: 'task',
        title: task.name,
        start: task.scheduledStart,
        end: task.scheduledEnd,
        priority: task.priority,
        status: task.status,
        color: task.project?.client?.color || '#3498db',
        client: task.project?.client?.companyName,
        project: task.project?.name,
        duration: task.duration,
        isOverdue: task.isOverdue
      })),
      ...events.map(event => ({
        id: event._id,
        type: 'event',
        title: event.name,
        start: event.startDateTime,
        end: event.endDateTime,
        eventType: event.type,
        color: event.color || '#e74c3c',
        location: event.location,
        description: event.description,
        duration: event.duration
      }))
    ].sort((a, b) => new Date(a.start) - new Date(b.start));

    const timeSlots = generateAvailableTimeSlots(start, end, calendarItems);
    
    res.json({
      success: true,
      data: {
        view,
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        items: calendarItems,
        availableSlots: timeSlots,
        stats: {
          totalTasks: scheduledTasks.length,
          totalEvents: events.length,
          totalItems: calendarItems.length,
          overdueTasks: scheduledTasks.filter(t => t.isOverdue).length,
          highPriorityTasks: scheduledTasks.filter(t => t.priority >= 4).length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/workload', validateInput, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [scheduledTasks, unscheduledTasks, events] = await Promise.all([
      Task.find({
        isActive: true,
        scheduledStart: { $exists: true },
        scheduledEnd: { $exists: true },
        scheduledStart: { $gte: start, $lte: end }
      })
      .populate({
        path: 'project',
        populate: { path: 'client' }
      }),

      Task.find({
        isActive: true,
        status: { $ne: 'completed' },
        dueDate: { $gte: start, $lte: end },
        $or: [
          { scheduledStart: { $exists: false } },
          { scheduledEnd: { $exists: false } }
        ]
      })
      .populate({
        path: 'project',
        populate: { path: 'client' }
      }),

      Event.find({
        isActive: true,
        startDateTime: { $gte: start, $lte: end }
      })
    ]);

    const totalScheduledHours = scheduledTasks.reduce((sum, task) => sum + task.duration, 0);
    const totalUnscheduledHours = unscheduledTasks.reduce((sum, task) => sum + task.duration, 0);
    const totalEventHours = events.reduce((sum, event) => sum + event.duration, 0);
    
    const workingHoursPerDay = 8;
    const daysInPeriod = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalAvailableHours = daysInPeriod * workingHoursPerDay;
    
    const totalCommittedHours = totalScheduledHours + totalEventHours;
    const availableHours = Math.max(0, totalAvailableHours - totalCommittedHours);
    
    const canScheduleAll = totalUnscheduledHours <= availableHours;
    const utilizationRate = Math.round((totalCommittedHours / totalAvailableHours) * 100);

    const clientWorkload = {};
    [...scheduledTasks, ...unscheduledTasks].forEach(task => {
      const clientName = task.project?.client?.companyName || 'Unknown';
      if (!clientWorkload[clientName]) {
        clientWorkload[clientName] = {
          scheduledHours: 0,
          unscheduledHours: 0,
          taskCount: 0,
          color: task.project?.client?.color
        };
      }
      
      if (task.isScheduled) {
        clientWorkload[clientName].scheduledHours += task.duration;
      } else {
        clientWorkload[clientName].unscheduledHours += task.duration;
      }
      clientWorkload[clientName].taskCount++;
    });

    res.json({
      success: true,
      data: {
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
          days: daysInPeriod
        },
        hours: {
          totalAvailable: totalAvailableHours,
          totalCommitted: totalCommittedHours,
          available: availableHours,
          scheduled: totalScheduledHours,
          unscheduled: totalUnscheduledHours,
          events: totalEventHours
        },
        tasks: {
          scheduled: scheduledTasks.length,
          unscheduled: unscheduledTasks.length,
          total: scheduledTasks.length + unscheduledTasks.length
        },
        analysis: {
          utilizationRate,
          canScheduleAll,
          overcommitted: utilizationRate > 100,
          recommendedAction: getWorkloadRecommendation(utilizationRate, canScheduleAll, totalUnscheduledHours)
        },
        clientBreakdown: Object.entries(clientWorkload).map(([name, data]) => ({
          client: name,
          ...data,
          totalHours: data.scheduledHours + data.unscheduledHours
        })).sort((a, b) => b.totalHours - a.totalHours)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/dashboard', validateInput, async (req, res, next) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const [
      todayTasks,
      weekTasks,
      overdueTasks,
      upcomingEvents,
      weeklyWorkload
    ] = await Promise.all([
      Task.find({
        isActive: true,
        scheduledStart: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        }
      }).populate({ path: 'project', populate: { path: 'client' } }),

      Task.find({
        isActive: true,
        scheduledStart: { $gte: startOfWeek, $lte: endOfWeek }
      }).populate({ path: 'project', populate: { path: 'client' } }),

      Task.find({
        isActive: true,
        status: { $ne: 'completed' },
        dueDate: { $lt: now }
      }).populate({ path: 'project', populate: { path: 'client' } }),

      Event.find({
        isActive: true,
        startDateTime: { $gte: now },
        endDateTime: { $lte: endOfWeek }
      }).sort({ startDateTime: 1 }).limit(5),

      Task.aggregate([
        {
          $match: {
            isActive: true,
            scheduledStart: { $gte: startOfWeek, $lte: endOfWeek }
          }
        },
        {
          $group: {
            _id: { $dayOfWeek: '$scheduledStart' },
            totalHours: { $sum: '$duration' },
            taskCount: { $sum: 1 }
          }
        }
      ])
    ]);

    const dailyBreakdown = Array.from({ length: 7 }, (_, i) => {
      const dayData = weeklyWorkload.find(w => w._id === i + 1) || { totalHours: 0, taskCount: 0 };
      return {
        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i],
        hours: dayData.totalHours,
        tasks: dayData.taskCount
      };
    });

    res.json({
      success: true,
      data: {
        today: {
          date: now.toISOString().split('T')[0],
          tasks: todayTasks,
          totalHours: todayTasks.reduce((sum, t) => sum + t.duration, 0)
        },
        week: {
          start: startOfWeek.toISOString(),
          end: endOfWeek.toISOString(),
          totalTasks: weekTasks.length,
          totalHours: weekTasks.reduce((sum, t) => sum + t.duration, 0),
          dailyBreakdown
        },
        alerts: {
          overdueTasks: overdueTasks.length,
          overdueList: overdueTasks.slice(0, 5).map(t => ({
            id: t._id,
            name: t.name,
            dueDate: t.dueDate,
            client: t.project?.client?.companyName,
            project: t.project?.name,
            priority: t.priority
          }))
        },
        upcomingEvents: upcomingEvents.map(e => ({
          id: e._id,
          name: e.name,
          start: e.startDateTime,
          type: e.type,
          location: e.location
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

function generateAvailableTimeSlots(startDate, endDate, existingItems) {
  const slots = [];
  const workingHours = { start: 9, end: 17 };
  
  const current = new Date(startDate);
  while (current <= endDate) {
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      const dayStart = new Date(current);
      dayStart.setHours(workingHours.start, 0, 0, 0);
      
      const dayEnd = new Date(current);
      dayEnd.setHours(workingHours.end, 0, 0, 0);
      
      const dayItems = existingItems.filter(item => {
        const itemStart = new Date(item.start);
        const itemEnd = new Date(item.end);
        return itemStart.toDateString() === current.toDateString();
      }).sort((a, b) => new Date(a.start) - new Date(b.start));
      
      let slotStart = dayStart;
      
      dayItems.forEach(item => {
        const itemStart = new Date(item.start);
        const itemEnd = new Date(item.end);
        
        if (slotStart < itemStart) {
          const duration = (itemStart - slotStart) / (1000 * 60 * 60);
          if (duration >= 0.5) {
            slots.push({
              start: new Date(slotStart),
              end: new Date(itemStart),
              duration: duration
            });
          }
        }
        slotStart = itemEnd > slotStart ? itemEnd : slotStart;
      });
      
      if (slotStart < dayEnd) {
        const duration = (dayEnd - slotStart) / (1000 * 60 * 60);
        if (duration >= 0.5) {
          slots.push({
            start: new Date(slotStart),
            end: new Date(dayEnd),
            duration: duration
          });
        }
      }
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return slots;
}

function getWorkloadRecommendation(utilizationRate, canScheduleAll, unscheduledHours) {
  if (utilizationRate > 100) {
    return 'Overcommitted - Consider rescheduling or delegating tasks';
  } else if (utilizationRate > 90) {
    return 'Near capacity - Avoid taking on additional work';
  } else if (!canScheduleAll) {
    return `${unscheduledHours}h of unscheduled work needs attention`;
  } else if (utilizationRate < 70) {
    return 'Available capacity - Can take on additional work';
  } else {
    return 'Good workload balance';
  }
}

module.exports = router;