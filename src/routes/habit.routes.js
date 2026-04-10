const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Habit = require('../models/Habit');

// Get all habits for a user
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new habit
router.post('/',
  auth,
  [
    body('title').trim().notEmpty(),
    body('frequency').isIn(['daily', 'weekly', 'monthly']),
    body('category').isIn(['health', 'productivity', 'self-care', 'learning', 'mindfulness', 'other'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const habit = new Habit({
        ...req.body,
        user: req.user._id
      });

      await habit.save();
      res.status(201).json(habit);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update a habit
router.patch('/:id',
  auth,
  async (req, res) => {
    try {
      const updates = Object.keys(req.body);
      const allowedUpdates = ['title', 'description', 'frequency', 'targetDays', 'reminderTime', 'category', 'isActive'];
      const isValidOperation = updates.every(update => allowedUpdates.includes(update));

      if (!isValidOperation) {
        return res.status(400).json({ message: 'Invalid updates' });
      }

      const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });

      if (!habit) {
        return res.status(404).json({ message: 'Habit not found' });
      }

      updates.forEach(update => habit[update] = req.body[update]);
      await habit.save();

      res.json(habit);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete a habit
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark habit as completed for today
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const today = new Date();
    if (!habit.isCompletedForDate(today)) {
      habit.completedDates.push(today);
      await habit.save();
    }

    res.json({
      completed: true,
      streak: habit.getCurrentStreak()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get habit statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const currentStreak = habit.getCurrentStreak();
    const totalCompletions = habit.completedDates.length;
    
    // Calculate completion rate
    const startDate = habit.startDate;
    const daysSinceStart = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
    const completionRate = daysSinceStart > 0 
      ? (totalCompletions / daysSinceStart * 100).toFixed(2)
      : 0;

    res.json({
      currentStreak,
      totalCompletions,
      completionRate,
      startDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 