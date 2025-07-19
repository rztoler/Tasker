const Task = require('../models/Task');
const Event = require('../models/Event');
const moment = require('moment-timezone');

class SmartScheduler {
  constructor() {
    this.workingHours = { start: 9, end: 17 };
    this.workingDays = [1, 2, 3, 4, 5];
    this.bufferTime = 0.25;
  }

  async scheduleTask(taskId, options = {}) {
    try {
      const task = await Task.findById(taskId).populate({
        path: 'project',
        populate: { path: 'client' }
      });

      if (!task || task.status === 'completed' || task.isLocked) {
        throw new Error('Task cannot be scheduled');
      }

      const timeZone = task.project?.client?.timeZone || 'UTC';
      const preferredStartDate = options.preferredStartDate || new Date();
      const maxSearchDays = options.maxSearchDays || 30;

      const availableSlot = await this.findOptimalTimeSlot(
        task,
        preferredStartDate,
        maxSearchDays,
        timeZone
      );

      if (!availableSlot) {
        throw new Error('No available time slot found within the search period');
      }

      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        {
          scheduledStart: availableSlot.start,
          scheduledEnd: availableSlot.end,
          status: task.status === 'pending' ? 'pending' : task.status
        },
        { new: true, runValidators: true }
      );

      return {
        success: true,
        task: updatedTask,
        slot: availableSlot,
        message: 'Task scheduled successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async rescheduleOverdueTasks() {
    try {
      const overdueTasks = await Task.find({
        isActive: true,
        status: { $ne: 'completed' },
        dueDate: { $lt: new Date() }
      }).populate({
        path: 'project',
        populate: { path: 'client' }
      });

      const results = [];

      for (const task of overdueTasks) {
        const result = await this.scheduleTask(task._id, {
          preferredStartDate: new Date(),
          maxSearchDays: 14
        });
        results.push({
          taskId: task._id,
          taskName: task.name,
          ...result
        });
      }

      return {
        success: true,
        processed: results.length,
        results
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async findOptimalTimeSlot(task, startDate, maxSearchDays, timeZone) {
    const searchEnd = moment(startDate).add(maxSearchDays, 'days');
    const currentDate = moment(startDate).tz(timeZone);

    while (currentDate.isBefore(searchEnd) && currentDate.isBefore(moment(task.dueDate))) {
      if (this.workingDays.includes(currentDate.day())) {
        const daySlots = await this.getAvailableSlotsForDay(currentDate.toDate(), timeZone);

        for (const slot of daySlots) {
          if (slot.duration >= task.duration) {
            const urgencyScore = this.calculateUrgencyScore(task, slot.start);
            const conflictLevel = await this.checkConflictLevel(slot.start, slot.end, task._id);

            if (conflictLevel === 'none') {
              return {
                start: slot.start,
                end: moment(slot.start).add(task.duration, 'hours').toDate(),
                urgencyScore,
                slotType: 'optimal'
              };
            }
          }
        }
      }
      currentDate.add(1, 'day');
    }

    return null;
  }

  async getAvailableSlotsForDay(date, timeZone) {
    const dayStart = moment(date).tz(timeZone).hour(this.workingHours.start).minute(0).second(0);
    const dayEnd = moment(date).tz(timeZone).hour(this.workingHours.end).minute(0).second(0);

    const [scheduledTasks, events] = await Promise.all([
      Task.find({
        isActive: true,
        scheduledStart: {
          $gte: dayStart.toDate(),
          $lt: dayEnd.toDate()
        }
      }).sort({ scheduledStart: 1 }),

      Event.find({
        isActive: true,
        startDateTime: {
          $gte: dayStart.toDate(),
          $lt: dayEnd.toDate()
        }
      }).sort({ startDateTime: 1 })
    ]);

    const occupiedSlots = [
      ...scheduledTasks.map(t => ({
        start: moment(t.scheduledStart),
        end: moment(t.scheduledEnd)
      })),
      ...events.map(e => ({
        start: moment(e.startDateTime),
        end: moment(e.endDateTime)
      }))
    ].sort((a, b) => a.start.valueOf() - b.start.valueOf());

    const availableSlots = [];
    let currentTime = dayStart.clone();

    for (const occupied of occupiedSlots) {
      if (currentTime.isBefore(occupied.start)) {
        const duration = moment.duration(occupied.start.diff(currentTime)).asHours();
        if (duration >= this.bufferTime) {
          availableSlots.push({
            start: currentTime.toDate(),
            end: occupied.start.toDate(),
            duration
          });
        }
      }
      currentTime = moment.max(currentTime, occupied.end);
    }

    if (currentTime.isBefore(dayEnd)) {
      const duration = moment.duration(dayEnd.diff(currentTime)).asHours();
      if (duration >= this.bufferTime) {
        availableSlots.push({
          start: currentTime.toDate(),
          end: dayEnd.toDate(),
          duration
        });
      }
    }

    return availableSlots;
  }

  calculateUrgencyScore(task, scheduledStart) {
    const daysUntilDue = moment(task.dueDate).diff(moment(scheduledStart), 'days');
    const priorityWeight = task.priority * 2;
    const timeWeight = Math.max(1, 10 - daysUntilDue);
    return priorityWeight + timeWeight;
  }

  async checkConflictLevel(startTime, endTime, excludeTaskId) {
    const conflicts = await Promise.all([
      Task.find({
        _id: { $ne: excludeTaskId },
        isActive: true,
        scheduledStart: { $lt: endTime },
        scheduledEnd: { $gt: startTime }
      }),
      Event.find({
        isActive: true,
        startDateTime: { $lt: endTime },
        endDateTime: { $gt: startTime }
      })
    ]);

    const totalConflicts = conflicts[0].length + conflicts[1].length;

    if (totalConflicts === 0) return 'none';
    if (totalConflicts === 1) return 'low';
    if (totalConflicts <= 3) return 'medium';
    return 'high';
  }

  async getOptimalSchedulingOrder(tasks) {
    const tasksWithScores = tasks.map(task => ({
      ...task.toObject(),
      urgencyScore: this.calculateTaskPriority(task)
    }));

    return tasksWithScores.sort((a, b) => {
      if (a.urgencyScore !== b.urgencyScore) {
        return b.urgencyScore - a.urgencyScore;
      }
      return moment(a.dueDate).valueOf() - moment(b.dueDate).valueOf();
    });
  }

  calculateTaskPriority(task) {
    const now = moment();
    const dueDate = moment(task.dueDate);
    const daysUntilDue = dueDate.diff(now, 'days');

    let score = task.priority * 10;

    if (daysUntilDue <= 1) score += 50;
    else if (daysUntilDue <= 3) score += 30;
    else if (daysUntilDue <= 7) score += 20;
    else if (daysUntilDue <= 14) score += 10;

    if (task.isOverdue) score += 100;

    const estimatedComplexity = Math.min(task.duration * 2, 20);
    score += estimatedComplexity;

    return score;
  }

  async batchScheduleTasks(taskIds, options = {}) {
    try {
      const tasks = await Task.find({
        _id: { $in: taskIds },
        isActive: true,
        status: { $ne: 'completed' }
      }).populate({
        path: 'project',
        populate: { path: 'client' }
      });

      const orderedTasks = await this.getOptimalSchedulingOrder(tasks);
      const results = [];

      for (const task of orderedTasks) {
        const result = await this.scheduleTask(task._id, {
          preferredStartDate: options.startDate || new Date(),
          maxSearchDays: options.maxSearchDays || 30
        });

        results.push({
          taskId: task._id,
          taskName: task.name,
          priority: task.priority,
          ...result
        });

        if (!result.success && options.stopOnError) {
          break;
        }
      }

      const successful = results.filter(r => r.success).length;

      return {
        success: true,
        totalTasks: taskIds.length,
        scheduled: successful,
        failed: results.length - successful,
        results
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async suggestRescheduling(taskId, newRequirements) {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const conflicts = await this.findSchedulingConflicts(task, newRequirements);
      const alternatives = await this.findAlternativeSlots(task, newRequirements);

      return {
        success: true,
        currentSchedule: {
          start: task.scheduledStart,
          end: task.scheduledEnd
        },
        conflicts,
        alternatives: alternatives.slice(0, 5),
        recommendation: this.generateReschedulingRecommendation(task, conflicts, alternatives)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async findSchedulingConflicts(task, requirements) {
    const { start, end } = requirements;

    const [taskConflicts, eventConflicts] = await Promise.all([
      Task.find({
        _id: { $ne: task._id },
        isActive: true,
        scheduledStart: { $lt: end },
        scheduledEnd: { $gt: start }
      }).populate({
        path: 'project',
        populate: { path: 'client' }
      }),

      Event.find({
        isActive: true,
        startDateTime: { $lt: end },
        endDateTime: { $gt: start }
      })
    ]);

    return {
      tasks: taskConflicts.map(t => ({
        id: t._id,
        name: t.name,
        priority: t.priority,
        client: t.project?.client?.companyName,
        scheduledStart: t.scheduledStart,
        scheduledEnd: t.scheduledEnd
      })),
      events: eventConflicts.map(e => ({
        id: e._id,
        name: e.name,
        type: e.type,
        startDateTime: e.startDateTime,
        endDateTime: e.endDateTime
      }))
    };
  }

  async findAlternativeSlots(task, requirements) {
    const timeZone = task.project?.client?.timeZone || 'UTC';
    const searchStart = moment(requirements.preferredStart || new Date());
    const searchEnd = searchStart.clone().add(requirements.maxSearchDays || 14, 'days');

    const alternatives = [];
    const currentDate = searchStart.clone();

    while (currentDate.isBefore(searchEnd) && alternatives.length < 10) {
      if (this.workingDays.includes(currentDate.day())) {
        const daySlots = await this.getAvailableSlotsForDay(currentDate.toDate(), timeZone);

        for (const slot of daySlots) {
          if (slot.duration >= task.duration) {
            const score = this.calculateSlotScore(task, slot);
            alternatives.push({
              start: slot.start,
              end: moment(slot.start).add(task.duration, 'hours').toDate(),
              duration: task.duration,
              score,
              dayOfWeek: moment(slot.start).format('dddd'),
              timeOfDay: moment(slot.start).format('HH:mm')
            });
          }
        }
      }
      currentDate.add(1, 'day');
    }

    return alternatives.sort((a, b) => b.score - a.score);
  }

  calculateSlotScore(task, slot) {
    let score = 0;

    const slotMoment = moment(slot.start);
    const hour = slotMoment.hour();

    if (hour >= 9 && hour <= 11) score += 10;
    else if (hour >= 14 && hour <= 16) score += 8;
    else if (hour >= 11 && hour <= 14) score += 5;

    const daysUntilDue = moment(task.dueDate).diff(slotMoment, 'days');
    if (daysUntilDue > 1) {
      score += Math.min(daysUntilDue, 10);
    }

    score += task.priority * 2;

    if (slot.duration > task.duration * 1.5) score += 5;

    return score;
  }

  generateReschedulingRecommendation(task, conflicts, alternatives) {
    if (conflicts.tasks.length === 0 && conflicts.events.length === 0) {
      return 'No conflicts detected. Current schedule is optimal.';
    }

    if (alternatives.length === 0) {
      return 'No alternative slots available. Consider extending search period or adjusting task requirements.';
    }

    const bestAlternative = alternatives[0];
    const conflictCount = conflicts.tasks.length + conflicts.events.length;

    if (conflictCount === 1) {
      return `Minor conflict detected. Suggested alternative: ${moment(
        bestAlternative.start
      ).format('YYYY-MM-DD HH:mm')}`;
    } else if (conflictCount <= 3) {
      return `Multiple conflicts detected. Best alternative: ${moment(bestAlternative.start).format(
        'YYYY-MM-DD HH:mm'
      )} (Score: ${bestAlternative.score})`;
    } else {
      return `Significant scheduling conflicts. Immediate rescheduling recommended to ${moment(
        bestAlternative.start
      ).format('YYYY-MM-DD HH:mm')}`;
    }
  }
}

module.exports = new SmartScheduler();
