const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Proteggi route - verifica token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Cerca token nell'header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Verifica se il token esiste
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accesso non autorizzato. Effettua il login'
      });
    }

    try {
      // Verifica token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gym-secret-key');

      // Cerca utente
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Utente non trovato'
        });
      }

      // Verifica se l'utente è attivo
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account disattivato. Contatta l\'amministratore'
        });
      }

      // Aggiungi utente alla request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token non valido'
      });
    }
  } catch (error) {
    console.error('Errore middleware protect:', error);
    res.status(500).json({
      success: false,
      message: 'Errore del server',
      error: error.message
    });
  }
};

// Autorizzazione basata su ruoli
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per accedere a questa risorsa'
      });
    }
    next();
  };
};

// Verifica se l'utente è il proprietario della risorsa o ha ruoli speciali
exports.isOwnerOrAdmin = (paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      
      // Admin può fare tutto
      if (req.user.role === 'admin') {
        return next();
      }

      // Verifica se l'utente è il proprietario
      if (req.user._id.toString() === resourceId) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per accedere a questa risorsa'
      });
    } catch (error) {
      console.error('Errore middleware isOwnerOrAdmin:', error);
      res.status(500).json({
        success: false,
        message: 'Errore del server',
        error: error.message
      });
    }
  };
};
