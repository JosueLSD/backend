const jwt = require('jsonwebtoken');
const HttpError = require('../utils/httpError');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return next(new HttpError(401, 'Token requerido'));

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new HttpError(401, 'Token inválido o expirado'));
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (roles.includes(req.usuario.rol)) return next();
    next(new HttpError(403, 'No tiene permiso para esta acción'));
  };
}

module.exports = { authenticate, authorize };
