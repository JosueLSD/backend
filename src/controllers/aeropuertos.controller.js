const { z } = require('zod');
const { Aeropuerto } = require('../models');
const { toAeropuertoDTO } = require('../serializers');

const crearSchema = z.object({
  codigo: z.string().trim().toUpperCase().length(4),
  nombre: z.string().trim().min(1).max(120),
  elevacion: z.string().trim().max(30).nullable().optional(),
  twr: z.string().trim().max(20).nullable().optional(),
  pista: z.string().trim().max(10).nullable().optional(),
});

async function listar(req, res) {
  const aeropuertos = await Aeropuerto.findAll({ order: [['codigo', 'ASC']] });
  res.json(aeropuertos.map(toAeropuertoDTO));
}

async function crear(req, res) {
  const aeropuerto = await Aeropuerto.create(crearSchema.parse(req.body));
  res.status(201).json(toAeropuertoDTO(aeropuerto));
}

module.exports = { listar, crear };
