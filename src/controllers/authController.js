const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Genera JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'gym-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Registrazione utente
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errore di validazione',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, phone, role } = req.body;

    // Verifica se l'email esiste già
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email già registrata'
      });
    }

    // Crea nuovo utente
    const userData = {
      firstName,
      lastName,
      email,
      password,
      phone
    };

    // Solo admin possono creare altri admin/coach
    if (role && req.user && req.user.role === 'admin') {
      userData.role = role;
    }

    // Se l'utente è creato da un coach
    if (req.user && req.user.role === 'coach') {
      userData.createdBy = req.user._id;
    }

    const user = await User.create(userData);

    // Genera token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Utente registrato con successo',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Errore registrazione:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la registrazione',
      error: error.message
    });
  }
};

// Login utente
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errore di validazione',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Cerca utente con password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email o password non validi'
      });
    }

    // Verifica se l'utente è attivo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account disattivato. Contatta l\'amministratore'
      });
    }

    // Verifica password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email o password non validi'
      });
    }

    // Genera token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login effettuato con successo',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          height: user.height,
          weight: user.weight,
          fitnessGoals: user.fitnessGoals
        },
        token
      }
    });
  } catch (error) {
    console.error('Errore login:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il login',
      error: error.message
    });
  }
};

// Ottieni profilo utente corrente
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Errore getMe:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero del profilo',
      error: error.message
    });
  }
};

// Aggiorna profilo utente
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'height', 'weight', 'fitnessGoals', 'notes'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profilo aggiornato con successo',
      data: { user }
    });
  } catch (error) {
    console.error('Errore updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento del profilo',
      error: error.message
    });
  }
};

// Cambia password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password attuale non corretta'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password cambiata con successo'
    });
  } catch (error) {
    console.error('Errore changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel cambio password',
      error: error.message
    });
  }
};
