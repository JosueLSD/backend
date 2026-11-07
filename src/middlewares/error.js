const { ZodError } = require('zod');

function notFound(req, res) {
  res.status(404).json({ message: 'Ruta no encontrada' });
}

function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: err.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message })),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'Ya existe un registro con esos datos' });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ message: 'Una de las referencias no existe' });
  }

  const status = err.status || 500;
  if (status === 500) console.error(err);

  res.status(status).json({
    message: status === 500 ? 'Error interno del servidor' : err.message,
  });
}

module.exports = { notFound, errorHandler };
