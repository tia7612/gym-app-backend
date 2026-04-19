const express = require('express');
const router = express.Router();
const { workoutPlanController } = require('../controllers');
const { protect, authorize } = require('../middleware/auth');
const { workoutPlanValidation, validateId } = require('../middleware/validation');

// Tutte le rotte richiedono autenticazione
router.use(protect);

// Rotte per tutti gli utenti
router.get('/', workoutPlanController.getAllWorkoutPlans);
router.get('/active/:userId', workoutPlanController.getActivePlan);
router.get('/:id', validateId('id'), workoutPlanController.getWorkoutPlan);

// Rotte protette (solo coach e admin possono creare/modificare)
router.post('/', authorize('coach', 'admin'), workoutPlanValidation, workoutPlanController.createWorkoutPlan);
router.put('/:id', validateId('id'), authorize('coach', 'admin'), workoutPlanController.updateWorkoutPlan);
router.delete('/:id', validateId('id'), authorize('coach', 'admin'), workoutPlanController.deleteWorkoutPlan);
router.post('/:id/duplicate', validateId('id'), authorize('coach', 'admin'), workoutPlanController.duplicateWorkoutPlan);
router.patch('/:id/toggle-status', validateId('id'), authorize('coach', 'admin'), workoutPlanController.togglePlanStatus);

module.exports = router;
