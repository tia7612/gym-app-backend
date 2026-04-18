const Exercise = require('../models/Exercise');

// Ottieni tutti gli esercizi
exports.getAllExercises = async (req, res) => {
  try {
    const { category, muscleGroup, search, difficulty } = req.query;
    
    let query = {};
    
    // Filtro per categoria
    if (category) {
      query.category = category;
    }
    
    // Filtro per gruppo muscolare
    if (muscleGroup) {
      query.muscleGroup = { $in: muscleGroup.split(',') };
    }
    
    // Filtro per difficoltà
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    // Filtro per ricerca testuale
    if (search) {
      query.$text = { $search: search };
    }
    
    // Mostra esercizi di default + quelli creati dall'utente
    query.$or = [
      { isDefault: true },
      { createdBy: req.user._id }
    ];

    const exercises = await Exercise.find(query)
      .sort({ category: 1, name: 1 });

    res.json({
      success: true,
      count: exercises.length,
      data: { exercises }
    });
  } catch (error) {
    console.error('Errore getAllExercises:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero degli esercizi',
      error: error.message
    });
  }
};

// Ottieni singolo esercizio
exports.getExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Esercizio non trovato'
      });
    }

    res.json({
      success: true,
      data: { exercise }
    });
  } catch (error) {
    console.error('Errore getExercise:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dell\'esercizio',
      error: error.message
    });
  }
};

// Crea nuovo esercizio
exports.createExercise = async (req, res) => {
  try {
    const { name, description, category, muscleGroup, equipment, difficulty, instructions, videoUrl } = req.body;

    const exercise = await Exercise.create({
      name,
      description,
      category,
      muscleGroup,
      equipment,
      difficulty,
      instructions,
      videoUrl,
      createdBy: req.user._id,
      isDefault: false
    });

    res.status(201).json({
      success: true,
      message: 'Esercizio creato con successo',
      data: { exercise }
    });
  } catch (error) {
    console.error('Errore createExercise:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella creazione dell\'esercizio',
      error: error.message
    });
  }
};

// Aggiorna esercizio
exports.updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Esercizio non trovato'
      });
    }

    // Solo il creatore può modificare esercizi non di default
    if (!exercise.isDefault && exercise.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per modificare questo esercizio'
      });
    }

    // Solo admin possono modificare esercizi di default
    if (exercise.isDefault && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo gli admin possono modificare esercizi di default'
      });
    }

    const allowedUpdates = ['name', 'description', 'category', 'muscleGroup', 'equipment', 'difficulty', 'instructions', 'videoUrl', 'imageUrl'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedExercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Esercizio aggiornato con successo',
      data: { exercise: updatedExercise }
    });
  } catch (error) {
    console.error('Errore updateExercise:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento dell\'esercizio',
      error: error.message
    });
  }
};

// Elimina esercizio
exports.deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Esercizio non trovato'
      });
    }

    // Solo il creatore può eliminare esercizi non di default
    if (!exercise.isDefault && exercise.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non hai i permessi per eliminare questo esercizio'
      });
    }

    // Non si possono eliminare esercizi di default
    if (exercise.isDefault) {
      return res.status(403).json({
        success: false,
        message: 'Non puoi eliminare esercizi di default'
      });
    }

    await Exercise.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Esercizio eliminato con successo'
    });
  } catch (error) {
    console.error('Errore deleteExercise:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nell\'eliminazione dell\'esercizio',
      error: error.message
    });
  }
};

// Ottieni categorie esercizi
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      { value: 'petto', label: 'Petto' },
      { value: 'schiena', label: 'Schiena' },
      { value: 'spalle', label: 'Spalle' },
      { value: 'braccia', label: 'Braccia' },
      { value: 'gambe', label: 'Gambe' },
      { value: 'core', label: 'Core' },
      { value: 'cardio', label: 'Cardio' },
      { value: 'altro', label: 'Altro' }
    ];

    const muscleGroups = [
      { value: 'petto', label: 'Petto' },
      { value: 'dorsali', label: 'Dorsali' },
      { value: 'trapezi', label: 'Trapezi' },
      { value: 'deltoidi', label: 'Deltoidi' },
      { value: 'bicipiti', label: 'Bicipiti' },
      { value: 'tricipiti', label: 'Tricipiti' },
      { value: 'avambracci', label: 'Avambracci' },
      { value: 'addominali', label: 'Addominali' },
      { value: 'lombari', label: 'Lombari' },
      { value: 'quadricipiti', label: 'Quadricipiti' },
      { value: 'femorali', label: 'Femorali' },
      { value: 'glutei', label: 'Glutei' },
      { value: 'polpacci', label: 'Polpacci' },
      { value: 'collo', label: 'Collo' },
      { value: 'cardio', label: 'Cardio' }
    ];

    const equipment = [
      { value: 'nessuno', label: 'Nessuno (corpo libero)' },
      { value: 'manubri', label: 'Manubri' },
      { value: 'bilanciere', label: 'Bilanciere' },
      { value: 'cavi', label: 'Cavi' },
      { value: 'macchinario', label: 'Macchinario' },
      { value: 'kettlebell', label: 'Kettlebell' },
      { value: 'elastici', label: 'Elastici' },
      { value: 'propria_peso', label: 'Peso corporeo' },
      { value: 'altro', label: 'Altro' }
    ];

    res.json({
      success: true,
      data: { categories, muscleGroups, equipment }
    });
  } catch (error) {
    console.error('Errore getCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle categorie',
      error: error.message
    });
  }
};
