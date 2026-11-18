const { Catalogo } = require('../models');

// Lista las tablas maestras. Con ?tipo=reglas_vuelo devuelve solo ese grupo.
async function listar(req, res) {
  const where = req.query.tipo ? { tipo: String(req.query.tipo) } : {};
  const catalogos = await Catalogo.findAll({
    where,
    attributes: ['id', 'tipo', 'codigo', 'descripcion'],
    order: [['tipo', 'ASC'], ['orden', 'ASC']],
  });
  res.json(catalogos);
}

module.exports = { listar };
