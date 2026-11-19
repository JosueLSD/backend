const { z } = require('zod');
const { Tripulante, Grado, Funcion, FirmaTripulante } = require('../models');
const { toTripulanteDTO } = require('../serializers');
const HttpError = require('../utils/httpError');

const texto = (max) => z.string().trim().max(max).nullable().optional();

// Grado y función se envían por nombre y se resuelven contra sus tablas maestras.
const crearSchema = z.object({
  grado: texto(30),
  nombre: z.string().trim().min(1).max(120),
  puesto: z.string().trim().min(1).max(60),
  funcion: texto(60),
  clasificacion: texto(60),
  cip: texto(20),
  celular: texto(20),
  horas: texto(20),
});

const actualizarSchema = crearSchema.partial();

const filtroSchema = z.object({ puesto: z.string().trim().min(1).optional() });

const includeTripulante = [
  { model: Grado, as: 'grado', attributes: ['id', 'nombre'] },
  { model: Funcion, as: 'funcion', attributes: ['id', 'nombre', 'puesto'] },
];

async function resolverGrado(nombre) {
  if (!nombre) return null;
  const grado = await Grado.findOne({ where: { nombre } });
  if (!grado) throw new HttpError(400, `El grado "${nombre}" no existe`);
  return grado.id;
}

// Si el puesto tiene una función fija, esa es la que se usa y el nombre enviado se ignora.
// En los demás puestos (Otros) se usa cualquier función ya creada; si no existe, se crea como libre.
async function resolverFuncion(puesto, nombre) {
  const fija = await Funcion.findOne({ where: { puesto } });
  if (fija) return fija.id;
  if (!nombre) return null;

  const existente = await Funcion.findOne({ where: { nombre } });
  if (existente) return existente.id;

  const nueva = await Funcion.create({ nombre, puesto: null });
  return nueva.id;
}

async function obtenerTripulante(id) {
  return Tripulante.findByPk(id, { include: includeTripulante });
}

async function listar(req, res) {
  const { puesto } = filtroSchema.parse(req.query);
  const where = puesto ? { puesto } : {};
  const tripulantes = await Tripulante.findAll({
    where,
    include: includeTripulante,
    order: [['puesto', 'ASC'], ['nombre', 'ASC']],
  });
  res.json(tripulantes.map(toTripulanteDTO));
}

async function crear(req, res) {
  const { grado, funcion, ...datos } = crearSchema.parse(req.body);
  const tripulante = await Tripulante.create({
    ...datos,
    grado_id: await resolverGrado(grado),
    funcion_id: await resolverFuncion(datos.puesto, funcion),
  });
  res.status(201).json(toTripulanteDTO(await obtenerTripulante(tripulante.id)));
}

async function actualizar(req, res) {
  const tripulante = await Tripulante.findByPk(req.params.id, { include: includeTripulante });
  if (!tripulante) throw new HttpError(404, 'Tripulante no encontrado');

  const { grado, funcion, ...datos } = actualizarSchema.parse(req.body);
  if (grado !== undefined) datos.grado_id = await resolverGrado(grado);

  if (funcion !== undefined || datos.puesto !== undefined) {
    const puesto = datos.puesto ?? tripulante.puesto;
    const nombreFuncion = funcion !== undefined ? funcion : tripulante.funcion?.nombre;
    datos.funcion_id = await resolverFuncion(puesto, nombreFuncion);
  }

  await tripulante.update(datos);
  res.json(toTripulanteDTO(await obtenerTripulante(tripulante.id)));
}

async function eliminar(req, res) {
  const tripulante = await Tripulante.findByPk(req.params.id);
  if (!tripulante) throw new HttpError(404, 'Tripulante no encontrado');

  // Si el tripulante estaba asignado a un vuelo, la BD deja ese campo vacío (SET NULL).
  await tripulante.destroy();
  res.status(204).end();
}

// Firma del tripulante (PNG en data URL). Vacía si no tiene.
async function obtenerFirma(req, res) {
  const tripulante = await Tripulante.findByPk(req.params.id, { attributes: ['id'] });
  if (!tripulante) throw new HttpError(404, 'Tripulante no encontrado');
  const firma = await FirmaTripulante.findByPk(tripulante.id);
  res.json({ firma: firma ? firma.firma : '' });
}

// Guarda o borra la firma. Cadena vacía = sin firma.
const firmaSchema = z.object({
  firma: z
    .string()
    .max(300000)
    .refine((s) => s === '' || s.startsWith('data:image/png;base64,'), 'La firma debe ser una imagen PNG'),
});

async function guardarFirma(req, res) {
  const tripulante = await Tripulante.findByPk(req.params.id, { attributes: ['id'] });
  if (!tripulante) throw new HttpError(404, 'Tripulante no encontrado');
  const { firma } = firmaSchema.parse(req.body);
  if (firma === '') {
    await FirmaTripulante.destroy({ where: { tripulanteId: tripulante.id } });
  } else {
    await FirmaTripulante.upsert({ tripulanteId: tripulante.id, firma });
  }
  res.json({ firma });
}

module.exports = { listar, crear, actualizar, eliminar, obtenerFirma, guardarFirma };
