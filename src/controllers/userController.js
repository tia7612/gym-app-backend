const User = require('../models/User');
const WorkoutPlan = require('../models/WorkoutPlan');
const WorkoutSession = require('../models/WorkoutSession');

// Ottieni tutti gli utenti (per coach/admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, isActive } = req.query;
    
    let query = {};
    
    // Filtro per ruolo
    if (role) {
      query.role = role;
    } else {
      // Di default mostra solo utenti normali
      query.role = 'user';
    }
    
    // Filtro per stato
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Filtro per ricerca
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Se è un coach, mostra solo gli utenti creati da lui
    if (req.user.role === 'coach') {
      query.createdBy = req.user._id;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: { users }
    });
  } catch (error) {
    console.error('Errore getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero degli utenti',
      error: error.message
    });
  }
};

// Ottieni singolo utente
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato'
      });
    }

    // Verifica permessi
    if (req.user.role === 'coach' && user.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per vedere questo utente'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Errore getUser:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dell\'utente',
      error: error.message
    });
  }
};

// Crea nuovo utente (da coach/admin)
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, dateOfBirth, height, weight, fitnessGoals, notes } = req.body;

    // Verifica se l'email esiste già
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email già registrata'
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: password || 'password123', // Password di default se non specificata
      phone,
      dateOfBirth,
      height,
      weight,
      fitnessGoals,
      notes,
      createdBy: req.user._id,
      role: 'user'
    });

    res.status(201).json({
      success: true,
      message: 'Utente creato con successo',
      data: { user }
    });
  } catch (error) {
    console.error('Errore createUser:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella creazione dell\'utente',
      error: error.message
    });
  }
};

// Aggiorna utente
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato'
      });
    }

    // Verifica permessi
    if (req.user.role === 'coach' && user.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per modificare questo utente'
      });
    }

    const allowedUpdates = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'height', 'weight', 'fitnessGoals', 'notes', 'isActive'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Utente aggiornato con successo',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Errore updateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento dell\'utente',
      error: error.message
    });
  }
};

// Elimina utente
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato'
      });
    }

    // Verifica permessi
    if (req.user.role === 'coach' && user.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per eliminare questo utente'
      });
    }

    // Soft delete - disattiva l'utente invece di eliminarlo
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Utente disattivato con successo'
    });
  } catch (error) {
    console.error('Errore deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella disattivazione dell\'utente',
      error: error.message
    });
  }
};

// Ottieni statistiche utente
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verifica permessi
    if (req.user.role === 'user' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per vedere queste statistiche'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato'
      });
    }

    // Statistiche allenamenti
    const totalWorkouts = await WorkoutSession.countDocuments({ user: userId });
    
    const lastWorkout = await WorkoutSession.findOne({ user: userId })
      .sort({ startTime: -1 })
      .select('startTime');
    
    const workoutsThisMonth = await WorkoutSession.countDocuments({
      user: userId,
      startTime: { $gte: new Date(new Date().setDate(1)) }
    });

    // Volume totale
    const volumeStats = await WorkoutSession.aggregate([
      { $match: { user: new require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: null, totalVolume: { $sum: '$totalVolume' } } }
    ]);

    // Schede attive
    const activePlans = await WorkoutPlan.countDocuments({
      user: userId,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        totalWorkouts,
        lastWorkout: lastWorkout?.startTime || null,
        workoutsThisMonth,
        totalVolume: volumeStats[0]?.totalVolume || 0,
        activePlans
      }
    });
  } catch (error) {
    console.error('Errore getUserStats:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle statistiche',
      error: error.message
    });
  }
};

// Ottieni dashboard coach
exports.getCoachDashboard = async (req, res) => {
  try {
    const coachId = req.user._id;

    // Conteggio utenti
    const totalUsers = await User.countDocuments({ createdBy: coachId, role: 'user' });
    const activeUsers = await User.countDocuments({ createdBy: coachId, role: 'user', isActive: true });
    
    // Allenamenti questa settimana
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const workoutsThisWeek = await WorkoutSession.countDocuments({
      startTime: { $gte: startOfWeek }
    });

    // Schede create
    const totalPlans = await WorkoutPlan.countDocuments({ createdBy: coachId });
    const activePlans = await WorkoutPlan.countDocuments({ createdBy: coachId, isActive: true });

    // Ultimi utenti registrati
    const recentUsers = await User.find({ createdBy: coachId, role: 'user' })
      .select('firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Ultimi allenamenti
    const recentWorkouts = await WorkoutSession.find()
      .populate('user', 'firstName lastName')
      .sort({ startTime: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          workoutsThisWeek,
          totalPlans,
          activePlans
        },
        recentUsers,
        recentWorkouts
      }
    });
  } catch (error) {
    console.error('Errore getCoachDashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero della dashboard',
      error: error.message
    });
  }
};
