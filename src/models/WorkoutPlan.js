const mongoose = require('mongoose');

const workoutExerciseSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  sets: {
    type: Number,
    required: true,
    min: 1
  },
  reps: {
    type: String, // Può essere "8-12" o "10"
    required: true
  },
  weight: {
    type: Number, // peso suggerito in kg
    default: 0
  },
  restSeconds: {
    type: Number,
    default: 60
  },
  notes: {
    type: String
  },
  tempo: {
    type: String // es: "3-1-2-0" per eccentrica-pausa-concentrica-pausa
  }
});

const workoutDaySchema = new mongoose.Schema({
  dayName: {
    type: String,
    required: true,
    trim: true
  },
  dayNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  exercises: [workoutExerciseSchema],
  notes: {
    type: String
  }
});

const workoutPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Il nome della scheda è obbligatorio'],
    trim: true
  },
  description: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  days: [workoutDaySchema],
  durationWeeks: {
    type: Number,
    default: 4
  },
  difficulty: {
    type: String,
    enum: ['principiante', 'intermedio', 'avanzato'],
    default: 'intermedio'
  },
  goal: {
    type: String,
    enum: ['forza', 'ipertrofia', 'definizione', 'resistenza', 'generale', 'recupero', 'altro'],
    default: 'generale'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index
workoutPlanSchema.index({ user: 1, isActive: 1 });
workoutPlanSchema.index({ createdBy: 1 });

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
