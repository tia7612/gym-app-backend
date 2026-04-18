const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  setNumber: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true,
    default: 0
  },
  reps: {
    type: Number,
    required: true
  },
  rpe: {
    type: Number, // Rate of Perceived Exertion (1-10)
    min: 1,
    max: 10
  },
  notes: {
    type: String
  },
  isCompleted: {
    type: Boolean,
    default: true
  }
});

const exerciseLogSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  exerciseName: {
    type: String, // Salvato per storico in caso di modifica dell'esercizio
    required: true
  },
  sets: [setSchema],
  notes: {
    type: String
  }
});

const workoutSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workoutPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutPlan'
  },
  dayName: {
    type: String
  },
  sessionName: {
    type: String,
    default: 'Allenamento'
  },
  exercises: [exerciseLogSchema],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // in minuti
  },
  totalVolume: {
    type: Number // peso totale sollevato (somma di peso * reps per ogni serie)
  },
  totalSets: {
    type: Number,
    default: 0
  },
  mood: {
    type: String,
    enum: ['ottimo', 'buono', 'normale', 'stanco', 'scarso']
  },
  energyLevel: {
    type: Number,
    min: 1,
    max: 10
  },
  sleepHours: {
    type: Number
  },
  bodyWeight: {
    type: Number // peso corporeo nel giorno dell'allenamento
  },
  notes: {
    type: String
  },
  location: {
    type: String
  }
}, {
  timestamps: true
});

// Index per query frequenti
workoutSessionSchema.index({ user: 1, startTime: -1 });
workoutSessionSchema.index({ user: 1, exercise: 1, startTime: -1 });

// Middleware pre-save per calcolare durata e volume
workoutSessionSchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  
  // Calcola volume totale
  let volume = 0;
  let sets = 0;
  this.exercises.forEach(ex => {
    ex.sets.forEach(set => {
      if (set.isCompleted) {
        volume += (set.weight * set.reps);
        sets++;
      }
    });
  });
  this.totalVolume = volume;
  this.totalSets = sets;
  
  next();
});

module.exports = mongoose.model('WorkoutSession', workoutSessionSchema);
