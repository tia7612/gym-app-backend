// Gestione errori MongoDB (duplicati, cast error, ecc.)
const handleMongoError = (err) => {
  let error = { ...err };
  error.message = err.message;

  // Errore di duplicazione (chiave univoca)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `Il valore '${err.keyValue[field]}' per il campo '${field}' è già in uso`;
    error.statusCode = 400;
    return error;
  }

  // CastError (ID non valido)
  if (err.name === 'CastError') {
    error.message = `Risorsa non trovata con id: ${err.value}`;
    error.statusCode = 404;
    return error;
  }

  // Validazione mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error.message = messages.join(', ');
    error.statusCode = 400;
    return error;
  }

  return error;
};

// Middleware gestione errori
exports.errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Errore:', err);

  // Gestione errori MongoDB
  if (err.name === 'CastError' || err.code === 11000 || err.name === 'ValidationError') {
    error = handleMongoError(err);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Errore del server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware per rotte non trovate
exports.notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Rotta non trovata - ${req.originalUrl}`
  });
};
