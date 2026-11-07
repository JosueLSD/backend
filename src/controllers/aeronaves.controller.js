const { z } = require('zod');
const { Aeronave } = require('../models');

const crearSchema = z.object({
  codigo: z.string().trim().toUpperCase().min(1).max(20),
});

async function listar(req, res) {
  const aeronaves = await Aeronave.findAll({
    where: { activo: true },
    attributes: ['id', 'codigo'],
    order: [['codigo', 'ASC']],
  });
  res.json(aeronaves);
}

async function crear(req, res) {
  const aeronave = await Aeronave.create(crearSchema.parse(req.body));
  res.status(201).json({ id: aeronave.id, codigo: aeronave.codigo });
}

module.exports = { listar, crear };
