const { Emergencia } = require('../models');

async function listar(req, res) {
  const emergencias = await Emergencia.findAll({ attributes: ['id', 'numero', 'nombre'], order: [['numero', 'ASC']] });
  res.json(emergencias);
}

module.exports = { listar };
