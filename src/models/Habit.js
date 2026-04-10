const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  targetDays: {
    type: Number,
    default: 1
  },
  completedDates: [{
    type: Date
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  reminderTime: {
    type: String
  },
  category: {
    type: String,
    enum: ['health', 'productivity', 'self-care', 'learning', 'mindfulness', 'other'],
    default: 'other'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to check if habit is completed for a specific date
habitSchema.methods.isCompletedForDate = function(date) {
  return this.completedDates.some(completedDate => 
    completedDate.toDateString() === date.toDateString()
  );
};

// Method to get completion streak
habitSchema.methods.getCurrentStreak = function() {
  if (this.completedDates.length === 0) return 0;
  
  const sortedDates = [...this.completedDates].sort((a, b) => b - a);
  let streak = 1;
  let currentDate = new Date(sortedDates[0]);
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i]);
    const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }
  
  return streak;
};

module.exports = mongoose.model('Habit', habitSchema); 