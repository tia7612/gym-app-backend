const express = require('express');
const router = express.Router();
const { exerciseController } = require('../controllers');
const { protect, authorize } = require('../middleware/auth');
const { exerciseValidation, validateId } = require('../middleware/validation');

// Tutte le rotte richiedono autenticazione
router.use(protect);

// Rotte pubbliche (per tutti gli utenti autenticati)
router.get('/', exerciseController.getAllExercises);
router.get('/categories', exerciseController.getCategories);
router.get('/:id', validateId('id'), exerciseController.getExercise);

// Rotte protette (solo coach e admin possono creare/modificare)
router.post('/', authorize('coach', 'admin'), exerciseValidation, exerciseController.createExercise);
router.put('/:id', validateId('id'), authorize('coach', 'admin'), exerciseController.updateExercise);
router.delete('/:id', validateId('id'), authorize('coach', 'admin'), exerciseController.deleteExercise);

module.exports = router;
