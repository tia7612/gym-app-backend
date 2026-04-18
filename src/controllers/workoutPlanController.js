const WorkoutPlan = require('../models/WorkoutPlan');
const User = require('../models/User');

// Ottieni tutte le schede
exports.getAllWorkoutPlans = async (req, res) => {
  try {
    const { user, isActive } = req.query;
    
    let query = {};
    
    // Filtro per utente
    if (user) {
      query.user = user;
    }
    
    // Filtro per stato
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Se è un utente normale, mostra solo le sue schede
    if (req.user.role === 'user') {
      query.user = req.user._id;
    }
    
    // Se è un coach, mostra solo le schede create da lui
    if (req.user.role === 'coach') {
      query.createdBy = req.user._id;
    }

    const plans = await WorkoutPlan.find(query)
      .populate('user', 'firstName lastName email')
      .populate('days.exercises.exercise', 'name category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: plans.length,
      data: { plans }
    });
  } catch (error) {
    console.error('Errore getAllWorkoutPlans:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle schede',
      error: error.message
    });
  }
};

// Ottieni scheda attiva per utente
exports.getActivePlan = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
    // Verifica permessi
    if (req.user.role === 'user' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per vedere questa scheda'
      });
    }

    const plan = await WorkoutPlan.findOne({
      user: userId,
      isActive: true
    })
      .populate('user', 'firstName lastName email')
      .populate('days.exercises.exercise', 'name category muscleGroup equipment instructions');

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Nessuna scheda attiva trovata'
      });
    }

    res.json({
      success: true,
      data: { plan }
    });
  } catch (error) {
    console.error('Errore getActivePlan:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero della scheda attiva',
      error: error.message
    });
  }
};

// Ottieni singola scheda
exports.getWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('days.exercises.exercise', 'name category muscleGroup equipment instructions videoUrl');
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Scheda non trovata'
      });
    }

    // Verifica permessi
    if (req.user.role === 'user' && plan.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per vedere questa scheda'
      });
    }

    if (req.user.role === 'coach' && plan.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per vedere questa scheda'
      });
    }

    res.json({
      success: true,
      data: { plan }
    });
  } catch (error) {
    console.error('Errore getWorkoutPlan:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero della scheda',
      error: error.message
    });
  }
};

// Crea nuova scheda
exports.createWorkoutPlan = async (req, res) => {
  try {
    const { name, description, user, days, durationWeeks, difficulty, goal, notes } = req.body;

    // Verifica che l'utente esista
    const targetUser = await User.findById(user);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato'
      });
    }

    // Verifica permessi
    if (req.user.role === 'coach' && targetUser.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi di creare schede per questo utente'
      });
    }

    // Disattiva eventuali schede attive precedenti
    await WorkoutPlan.updateMany(
      { user, isActive: true },
      { isActive: false, endDate: new Date() }
    );

    const plan = await WorkoutPlan.create({
      name,
      description,
      user,
      createdBy: req.user._id,
      days,
      durationWeeks,
      difficulty,
      goal,
      notes,
      isActive: true,
      startDate: new Date()
    });

    const populatedPlan = await WorkoutPlan.findById(plan._id)
      .populate('user', 'firstName lastName email')
      .populate('days.exercises.exercise', 'name category');

    res.status(201).json({
      success: true,
      message: 'Scheda creata con successo',
      data: { plan: populatedPlan }
    });
  } catch (error) {
    console.error('Errore createWorkoutPlan:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella creazione della scheda',
      error: error.message
    });
  }
};

// Aggiorna scheda
exports.updateWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Scheda non trovata'
      });
    }

    // Verifica permessi
    if (req.user.role === 'coach' && plan.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per modificare questa scheda'
      });
    }

    const allowedUpdates = ['name', 'description', 'days', 'durationWeeks', 'difficulty', 'goal', 'notes', 'isActive', 'endDate'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedPlan = await WorkoutPlan.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('user', 'firstName lastName email')
      .populate('days.exercises.exercise', 'name category');

    res.json({
      success: true,
      message: 'Scheda aggiornata con successo',
      data: { plan: updatedPlan }
    });
  } catch (error) {
    console.error('Errore updateWorkoutPlan:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento della scheda',
      error: error.message
    });
  }
};

// Elimina scheda
exports.deleteWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Scheda non trovata'
      });
    }

    // Verifica permessi
    if (req.user.role === 'coach' && plan.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per eliminare questa scheda'
      });
    }

    await WorkoutPlan.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Scheda eliminata con successo'
    });
  } catch (error) {
    console.error('Errore deleteWorkoutPlan:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'eliminazione della scheda',
      error: error.message
    });
  }
};

// Duplica scheda
exports.duplicateWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Scheda non trovata'
      });
    }

    const { newUserId } = req.body;
    
    // Crea una copia della scheda
    const newPlanData = plan.toObject();
    delete newPlanData._id;
    delete newPlanData.createdAt;
    delete newPlanData.updatedAt;
    
    newPlanData.name = `${newPlanData.name} (Copia)`;
    newPlanData.user = newUserId || plan.user;
    newPlanData.createdBy = req.user._id;
    newPlanData.isActive = false; // La copia è disattivata di default
    newPlanData.startDate = null;
    newPlanData.endDate = null;

    const newPlan = await WorkoutPlan.create(newPlanData);

    const populatedPlan = await WorkoutPlan.findById(newPlan._id)
      .populate('user', 'firstName lastName email')
      .populate('days.exercises.exercise', 'name category');

    res.status(201).json({
      success: true,
      message: 'Scheda duplicata con successo',
      data: { plan: populatedPlan }
    });
  } catch (error) {
    console.error('Errore duplicateWorkoutPlan:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella duplicazione della scheda',
      error: error.message
    });
  }
};

// Attiva/Disattiva scheda
exports.togglePlanStatus = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Scheda non trovata'
      });
    }

    // Verifica permessi
    if (req.user.role === 'coach' && plan.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per modificare questa scheda'
      });
    }

    // Se stiamo attivando la scheda, disattiva le altre
    if (!plan.isActive) {
      await WorkoutPlan.updateMany(
        { user: plan.user, isActive: true },
        { isActive: false, endDate: new Date() }
      );
      plan.isActive = true;
      plan.startDate = new Date();
      plan.endDate = null;
    } else {
      plan.isActive = false;
      plan.endDate = new Date();
    }

    await plan.save();

    res.json({
      success: true,
      message: `Scheda ${plan.isActive ? 'attivata' : 'disattivata'} con successo`,
      data: { plan }
    });
  } catch (error) {
    console.error('Errore togglePlanStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel cambio stato della scheda',
      error: error.message
    });
  }
};
