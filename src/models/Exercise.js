const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Il nome dell\'esercizio è obbligatorio'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['petto', 'schiena', 'spalle', 'braccia', 'gambe', 'core', 'cardio', 'altro']
  },
  muscleGroup: [{
    type: String,
    enum: ['petto', 'dorsali', 'trapezi', 'deltoidi', 'bicipiti', 'tricipiti', 'avambracci', 'addominali', 'lombari', 'quadricipiti', 'femorali', 'glutei', 'polpacci', 'collo', 'cardio']
  }],
  equipment: {
    type: String,
    enum: ['nessuno', 'manubri', 'bilanciere', 'cavi', 'macchinario', 'kettlebell', 'elastici', 'propria_peso', 'altro'],
    default: 'nessuno'
  },
  difficulty: {
    type: String,
    enum: ['principiante', 'intermedio', 'avanzato'],
    default: 'intermedio'
  },
  instructions: {
    type: String
  },
  videoUrl: {
    type: String
  },
  imageUrl: {
    type: String
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index per ricerche rapide
exerciseSchema.index({ category: 1 });
exerciseSchema.index({ muscleGroup: 1 });
exerciseSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Exercise', exerciseSchema);
