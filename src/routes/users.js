const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { protect, authorize } = require('../middleware/auth');
const { createUserValidation, validateId } = require('../middleware/validation');

// Tutte le rotte richiedono autenticazione
router.use(protect);

// Dashboard coach (solo coach e admin)
router.get('/dashboard', authorize('coach', 'admin'), userController.getCoachDashboard);

// Rotte per coach e admin
router.get('/', authorize('coach', 'admin'), userController.getAllUsers);
router.post('/', authorize('coach', 'admin'), createUserValidation, userController.createUser);

// Rotte per singolo utente
router.get('/:id', validateId('id'), userController.getUser);
router.put('/:id', validateId('id'), authorize('coach', 'admin'), userController.updateUser);
router.delete('/:id', validateId('id'), authorize('coach', 'admin'), userController.deleteUser);
router.get('/:id/stats', validateId('id'), userController.getUserStats);

module.exports = router;
