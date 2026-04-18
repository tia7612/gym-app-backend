const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Carica variabili d'ambiente
dotenv.config();

// Importa configurazioni
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Importa route
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const exerciseRoutes = require('./routes/exercises');
const workoutPlanRoutes = require('./routes/workoutPlans');
const workoutSessionRoutes = require('./routes/workoutSessions');

// Inizializza app
const app = express();

// Connetti al database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging in sviluppo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server attivo e funzionante',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workout-plans', workoutPlanRoutes);
app.use('/api/workout-sessions', workoutSessionRoutes);

// Gestione rotte non trovate
app.use(notFound);

// Gestione errori
app.use(errorHandler);

// Porta
const PORT = process.env.PORT || 5000;

// Avvia server
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🏋️  GYM MANAGEMENT API SERVER                          ║
║                                                            ║
║     Server in ascolto sulla porta ${PORT}                      ║
║     Ambiente: ${(process.env.NODE_ENV || 'development').padEnd(20)}                 ║
║     Database: MongoDB                                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Gestione errori non catturati
process.on('unhandledRejection', (err) => {
  console.error('ERRORE NON GESTITO:', err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('ECCEZIONE NON CATTURATA:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
