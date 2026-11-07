const { Grado } = require('../models');

async function listar(req, res) {
  const grados = await Grado.findAll({ attributes: ['id', 'nombre'], order: [['nombre', 'ASC']] });
  res.json(grados);
}

module.exports = { listar };
