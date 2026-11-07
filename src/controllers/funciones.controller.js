const { Funcion } = require('../models');

async function listar(req, res) {
  const funciones = await Funcion.findAll({
    attributes: ['id', 'nombre', 'puesto'],
    order: [['nombre', 'ASC']],
  });
  res.json(funciones);
}

module.exports = { listar };
