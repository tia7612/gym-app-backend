const { body, param } = require('express-validator');

// Validazione registrazione
exports.registerValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Il nome è obbligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('Il nome deve essere tra 2 e 50 caratteri'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Il cognome è obbligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('Il cognome deve essere tra 2 e 50 caratteri'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'email è obbligatoria')
    .isEmail()
    .withMessage('Inserisci un\'email valida')
    .normalizeEmail(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('La password è obbligatoria')
    .isLength({ min: 6 })
    .withMessage('La password deve essere di almeno 6 caratteri')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La password deve contenere almeno una lettera maiuscola, una minuscola e un numero'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .withMessage('Inserisci un numero di telefono valido')
];

// Validazione login
exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'email è obbligatoria')
    .isEmail()
    .withMessage('Inserisci un\'email valida')
    .normalizeEmail(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('La password è obbligatoria')
];

// Validazione creazione utente (da coach)
exports.createUserValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Il nome è obbligatorio'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Il cognome è obbligatorio'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'email è obbligatoria')
    .isEmail()
    .withMessage('Inserisci un\'email valida')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La password deve essere di almeno 6 caratteri')
];

// Validazione esercizio
exports.exerciseValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Il nome dell\'esercizio è obbligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('Il nome deve essere tra 2 e 100 caratteri'),
  body('category')
    .notEmpty()
    .withMessage('La categoria è obbligatoria')
    .isIn(['petto', 'schiena', 'spalle', 'braccia', 'gambe', 'core', 'cardio', 'altro'])
    .withMessage('Categoria non valida'),
  body('muscleGroup')
    .optional()
    .isArray()
    .withMessage('I gruppi muscolari devono essere un array'),
  body('difficulty')
    .optional()
    .isIn(['principiante', 'intermedio', 'avanzato'])
    .withMessage('Difficoltà non valida')
];

// Validazione scheda allenamento
exports.workoutPlanValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Il nome della scheda è obbligatorio'),
  body('user')
    .notEmpty()
    .withMessage('L\'utente è obbligatorio')
    .isMongoId()
    .withMessage('ID utente non valido'),
  body('days')
    .optional()
    .isArray()
    .withMessage('I giorni devono essere un array'),
  body('durationWeeks')
    .optional()
    .isInt({ min: 1, max: 52 })
    .withMessage('La durata deve essere tra 1 e 52 settimane'),
  body('difficulty')
    .optional()
    .isIn(['principiante', 'intermedio', 'avanzato'])
    .withMessage('Difficoltà non valida'),
  body('goal')
    .optional()
    .isIn(['forza', 'ipertrofia', 'definizione', 'resistenza', 'generale', 'recupero', 'altro'])
    .withMessage('Obiettivo non valido')
];

// Validazione sessione allenamento
exports.workoutSessionValidation = [
  body('sessionName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Il nome della sessione deve essere tra 1 e 100 caratteri'),
  body('exercises')
    .isArray({ min: 1 })
    .withMessage('Devi aggiungere almeno un esercizio'),
  body('exercises.*.exercise')
    .notEmpty()
    .withMessage('L\'esercizio è obbligatorio')
    .isMongoId()
    .withMessage('ID esercizio non valido'),
  body('exercises.*.sets')
    .isArray({ min: 1 })
    .withMessage('Devi aggiungere almeno una serie'),
  body('energyLevel')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Il livello di energia deve essere tra 1 e 10')
];

// Validazione ID MongoDB
exports.validateId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`ID ${paramName} non valido`)
];
