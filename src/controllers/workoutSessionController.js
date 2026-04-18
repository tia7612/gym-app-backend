const WorkoutSession = require('../models/WorkoutSession');
const WorkoutPlan = require('../models/WorkoutPlan');

// Ottieni tutte le sessioni
exports.getAllSessions = async (req, res) => {
  try {
    const { user, startDate, endDate, limit = 50 } = req.query;
    
    let query = {};
    
    // Filtro per utente
    if (user) {
      query.user = user;
    } else if (req.user.role === 'user') {
      query.user = req.user._id;
    }
    
    // Filtro per data
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
    }

    const sessions = await WorkoutSession.find(query)
      .populate('user', 'firstName lastName')
      .populate('exercises.exercise', 'name category')
      .sort({ startTime: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: sessions.length,
      data: { sessions }
    });
  } catch (error) {
    console.error('Errore getAllSessions:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle sessioni',
      error: error.message
    });
  }
};

// Ottieni singola sessione
exports.getSession = async (req, res) => {
  try {
    const session = await WorkoutSession.findById(req.params.id)
      .populate('user', 'firstName lastName')
      .populate('exercises.exercise', 'name category muscleGroup equipment instructions');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sessione non trovata'
      });
    }

    // Verifica permessi
    if (req.user.role === 'user' && session.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per vedere questa sessione'
      });
    }

    res.json({
      success: true,
      data: { session }
    });
  } catch (error) {
    console.error('Errore getSession:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero della sessione',
      error: error.message
    });
  }
};

// Crea nuova sessione
exports.createSession = async (req, res) => {
  try {
    const {
      workoutPlan,
      dayName,
      sessionName,
      exercises,
      mood,
      energyLevel,
      sleepHours,
      bodyWeight,
      notes,
      location
    } = req.body;

    const session = await WorkoutSession.create({
      user: req.user._id,
      workoutPlan,
      dayName,
      sessionName,
      exercises,
      mood,
      energyLevel,
      sleepHours,
      bodyWeight,
      notes,
      location,
      startTime: new Date()
    });

    const populatedSession = await WorkoutSession.findById(session._id)
      .populate('exercises.exercise', 'name category');

    res.status(201).json({
      success: true,
      message: 'Sessione creata con successo',
      data: { session: populatedSession }
    });
  } catch (error) {
    console.error('Errore createSession:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella creazione della sessione',
      error: error.message
    });
  }
};

// Aggiorna sessione (aggiungi esercizi o termina)
exports.updateSession = async (req, res) => {
  try {
    const session = await WorkoutSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sessione non trovata'
      });
    }

    // Verifica permessi
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per modificare questa sessione'
      });
    }

    const allowedUpdates = ['exercises', 'mood', 'energyLevel', 'sleepHours', 'bodyWeight', 'notes', 'endTime'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Se viene impostata endTime, calcola la durata
    if (updates.endTime) {
      updates.endTime = new Date(updates.endTime);
    }

    const updatedSession = await WorkoutSession.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('exercises.exercise', 'name category');

    res.json({
      success: true,
      message: 'Sessione aggiornata con successo',
      data: { session: updatedSession }
    });
  } catch (error) {
    console.error('Errore updateSession:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento della sessione',
      error: error.message
    });
  }
};

// Termina sessione
exports.endSession = async (req, res) => {
  try {
    const session = await WorkoutSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sessione non trovata'
      });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per modificare questa sessione'
      });
    }

    session.endTime = new Date();
    await session.save();

    const populatedSession = await WorkoutSession.findById(session._id)
      .populate('exercises.exercise', 'name category');

    res.json({
      success: true,
      message: 'Sessione terminata con successo',
      data: { session: populatedSession }
    });
  } catch (error) {
    console.error('Errore endSession:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella terminazione della sessione',
      error: error.message
    });
  }
};

// Elimina sessione
exports.deleteSession = async (req, res) => {
  try {
    const session = await WorkoutSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sessione non trovata'
      });
    }

    if (session.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per eliminare questa sessione'
      });
    }

    await WorkoutSession.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Sessione eliminata con successo'
    });
  } catch (error) {
    console.error('Errore deleteSession:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'eliminazione della sessione',
      error: error.message
    });
  }
};

// Ottieni statistiche progressi
exports.getProgressStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const { exerciseId, period = '3months' } = req.query;
    
    // Verifica permessi
    if (req.user.role === 'user' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per vedere queste statistiche'
      });
    }

    // Calcola data inizio in base al periodo
    const startDate = new Date();
    switch (period) {
      case '1month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 3);
    }

    // Statistiche generali
    const generalStats = await WorkoutSession.aggregate([
      {
        $match: {
          user: new require('mongoose').Types.ObjectId(userId),
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalVolume: { $sum: '$totalVolume' },
          totalSets: { $sum: '$totalSets' },
          avgDuration: { $avg: '$duration' },
          avgEnergyLevel: { $avg: '$energyLevel' }
        }
      }
    ]);

    // Allenamenti per settimana
    const workoutsByWeek = await WorkoutSession.aggregate([
      {
        $match: {
          user: new require('mongoose').Types.ObjectId(userId),
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$startTime' },
            week: { $week: '$startTime' }
          },
          count: { $sum: 1 },
          volume: { $sum: '$totalVolume' }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);

    // Volume nel tempo
    const volumeOverTime = await WorkoutSession.aggregate([
      {
        $match: {
          user: new require('mongoose').Types.ObjectId(userId),
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$startTime' },
            month: { $month: '$startTime' },
            day: { $dayOfMonth: '$startTime' }
          },
          volume: { $sum: '$totalVolume' },
          date: { $first: '$startTime' }
        }
      },
      { $sort: { date: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          volume: 1
        }
      }
    ]);

    // Progresso per esercizio specifico
    let exerciseProgress = [];
    if (exerciseId) {
      exerciseProgress = await WorkoutSession.aggregate([
        {
          $match: {
            user: new require('mongoose').Types.ObjectId(userId),
            startTime: { $gte: startDate },
            'exercises.exercise': new require('mongoose').Types.ObjectId(exerciseId)
          }
        },
        { $unwind: '$exercises' },
        {
          $match: {
            'exercises.exercise': new require('mongoose').Types.ObjectId(exerciseId)
          }
        },
        {
          $project: {
            date: '$startTime',
            sets: '$exercises.sets',
            exerciseName: '$exercises.exerciseName'
          }
        },
        { $sort: { date: 1 } }
      ]);
    }

    // Esercizi più frequenti
    const topExercises = await WorkoutSession.aggregate([
      {
        $match: {
          user: new require('mongoose').Types.ObjectId(userId),
          startTime: { $gte: startDate }
        }
      },
      { $unwind: '$exercises' },
      {
        $group: {
          _id: '$exercises.exercise',
          exerciseName: { $first: '$exercises.exerciseName' },
          count: { $sum: 1 },
          totalVolume: {
            $sum: {
              $reduce: {
                input: '$exercises.sets',
                initialValue: 0,
                in: { $add: ['$$value', { $multiply: ['$$this.weight', '$$this.reps'] }] }
              }
            }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        generalStats: generalStats[0] || {
          totalWorkouts: 0,
          totalVolume: 0,
          totalSets: 0,
          avgDuration: 0,
          avgEnergyLevel: 0
        },
        workoutsByWeek,
        volumeOverTime,
        exerciseProgress,
        topExercises
      }
    });
  } catch (error) {
    console.error('Errore getProgressStats:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle statistiche',
      error: error.message
    });
  }
};

// Ottieni storico per esercizio
exports.getExerciseHistory = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const { exerciseId } = req.params;
    
    // Verifica permessi
    if (req.user.role === 'user' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per vedere questo storico'
      });
    }

    const history = await WorkoutSession.aggregate([
      {
        $match: {
          user: new require('mongoose').Types.ObjectId(userId),
          'exercises.exercise': new require('mongoose').Types.ObjectId(exerciseId)
        }
      },
      { $unwind: '$exercises' },
      {
        $match: {
          'exercises.exercise': new require('mongoose').Types.ObjectId(exerciseId)
        }
      },
      {
        $project: {
          _id: 0,
          sessionId: '$_id',
          date: '$startTime',
          exerciseName: '$exercises.exerciseName',
          sets: '$exercises.sets',
          totalVolume: {
            $reduce: {
              input: '$exercises.sets',
              initialValue: 0,
              in: { $add: ['$$value', { $multiply: ['$$this.weight', '$$this.reps'] }] }
            }
          },
          maxWeight: {
            $max: '$exercises.sets.weight'
          },
          totalReps: {
            $sum: '$exercises.sets.reps'
          }
        }
      },
      { $sort: { date: -1 } }
    ]);

    res.json({
      success: true,
      count: history.length,
      data: { history }
    });
  } catch (error) {
    console.error('Errore getExerciseHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dello storico',
      error: error.message
    });
  }
};
