const express = require('express');
const router = express.Router();
const { workoutSessionController } = require('../controllers');
const { protect, authorize } = require('../middleware/auth');
const { workoutSessionValidation, validateId } = require('../middleware/validation');

// Tutte le rotte richiedono autenticazione
router.use(protect);

// Rotte per tutti gli utenti
router.get('/', workoutSessionController.getAllSessions);
router.get('/stats/:userId?', workoutSessionController.getProgressStats);
router.get('/history/:exerciseId/:userId?', workoutSessionController.getExerciseHistory);
router.get('/:id', validateId('id'), workoutSessionController.getSession);

// Creazione e modifica sessioni (tutti gli utenti possono registrare i propri allenamenti)
router.post('/', workoutSessionValidation, workoutSessionController.createSession);
router.put('/:id', validateId('id'), workoutSessionController.updateSession);
router.patch('/:id/end', validateId('id'), workoutSessionController.endSession);

// Eliminazione (utenti possono eliminare solo le proprie sessioni, admin tutte)
router.delete('/:id', validateId('id'), workoutSessionController.deleteSession);

module.exports = router;
