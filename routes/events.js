const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { validateEvent } = require('../middleware/validation');
const { validateInput } = require('../middleware/security');

router.get('/', validateInput, async (req, res, next) => {
  try {
    const { startDate, endDate, type, page = 1, limit = 50 } = req.query;
    const filter = { isActive: true };
    
    if (type) filter.type = type;
    
    if (startDate && endDate) {
      filter.startDateTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const skip = (page - 1) * limit;
    const events = await Event.find(filter)
      .sort({ startDateTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      data: events,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: events.length,
        totalCount: total
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/upcoming', validateInput, async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + parseInt(days));

    const events = await Event.find({
      isActive: true,
      startDateTime: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ startDateTime: 1 });

    res.json({
      success: true,
      data: events,
      count: events.length,
      period: `Next ${days} days`
    });
  } catch (error) {
    next(error);
  }
});

router.get('/conflicts', validateInput, async (req, res, next) => {
  try {
    const { startDateTime, endDateTime, excludeId } = req.query;

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({
        success: false,
        error: 'startDateTime and endDateTime are required'
      });
    }

    const filter = {
      isActive: true,
      $or: [
        {
          startDateTime: { $lt: new Date(endDateTime) },
          endDateTime: { $gt: new Date(startDateTime) }
        }
      ]
    };

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    const conflicts = await Event.find(filter);

    res.json({
      success: true,
      data: conflicts,
      count: conflicts.length,
      hasConflicts: conflicts.length > 0
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validateInput, async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, isActive: true });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateInput, validateEvent, async (req, res, next) => {
  try {
    const { date, startTime, endTime, ...eventData } = req.body;
    
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (endDateTime <= startDateTime) {
      return res.status(400).json({
        success: false,
        error: 'End time must be after start time'
      });
    }

    const conflicts = await Event.find({
      isActive: true,
      $or: [
        {
          startDateTime: { $lt: endDateTime },
          endDateTime: { $gt: startDateTime }
        }
      ]
    });

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Time slot conflicts with existing events',
        conflicts: conflicts.map(e => ({
          id: e._id,
          name: e.name,
          startDateTime: e.startDateTime,
          endDateTime: e.endDateTime
        }))
      });
    }

    const event = new Event({
      ...eventData,
      startDateTime,
      endDateTime
    });

    await event.save();

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateInput, validateEvent, async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, isActive: true });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const { date, startTime, endTime, ...eventData } = req.body;
    
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (endDateTime <= startDateTime) {
      return res.status(400).json({
        success: false,
        error: 'End time must be after start time'
      });
    }

    const conflicts = await Event.find({
      _id: { $ne: req.params.id },
      isActive: true,
      $or: [
        {
          startDateTime: { $lt: endDateTime },
          endDateTime: { $gt: startDateTime }
        }
      ]
    });

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Time slot conflicts with existing events',
        conflicts: conflicts.map(e => ({
          id: e._id,
          name: e.name,
          startDateTime: e.startDateTime,
          endDateTime: e.endDateTime
        }))
      });
    }

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: req.params.id },
      {
        ...eventData,
        startDateTime,
        endDateTime
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedEvent,
      message: 'Event updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', validateInput, async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, isActive: true });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    await Event.findOneAndUpdate(
      { _id: req.params.id },
      { isActive: false },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/calendar/:year/:month', validateInput, async (req, res, next) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const events = await Event.find({
      isActive: true,
      startDateTime: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ startDateTime: 1 });

    const calendar = {};
    events.forEach(event => {
      const day = event.startDateTime.getDate();
      if (!calendar[day]) {
        calendar[day] = [];
      }
      calendar[day].push(event);
    });

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        month: parseInt(month),
        events: calendar,
        totalEvents: events.length
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;