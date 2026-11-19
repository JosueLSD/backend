const { z } = require('zod');
const { sequelize, Vuelo, Aeronave, Aeropuerto, Tripulante, Usuario, Grado, Funcion, ImagenSatelital } = require('../models');
const { borrarObjetos } = require('../utils/s3');
const { CAMPOS_DOTACION } = require('../constants');
const { toVueloDTO } = require('../serializers');
const HttpError = require('../utils/httpError');

const CAMPOS = Object.keys(CAMPOS_DOTACION);

const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM');

// Alta del vuelo: aeronave, origen y destino. Las horas se completan en el paso CONFECCIÓN.
const crearSchema = z
  .object({
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD'),
    aeronave_id: z.number().int().positive(),
    origen_id: z.number().int().positive(),
    destino_id: z.number().int().positive(),
  })
  .refine((datos) => datos.origen_id !== datos.destino_id, {
    message: 'Origen y destino deben ser distintos',
    path: ['destino_id'],
  });

// Paso 1 (CONFECCIÓN): horas de salida y llegada en UTC.
const horasSchema = z.object({
  hora_salida: hora.nullable(),
  hora_llegada: hora.nullable(),
});

// Aeronave y ruta de un vuelo pendiente (CONFECCIÓN). Origen y destino deben ser distintos.
const rutaSchema = z
  .object({
    aeronave_id: z.number().int().positive(),
    origen_id: z.number().int().positive(),
    destino_id: z.number().int().positive(),
  })
  .refine((datos) => datos.origen_id !== datos.destino_id, {
    message: 'Origen y destino deben ser distintos',
    path: ['destino_id'],
  });

// Paso 2 (DOTACIÓN): cada campo recibe el id de un tripulante o null para vaciarlo.
const dotacionSchema = z
  .object(Object.fromEntries(CAMPOS.map((campo) => [campo, z.number().int().positive().nullable()])))
  .partial();

// Pasos 3 a 9 y datos de dotación que no son tripulantes. Solo se aceptan estas claves.
const despachoSchema = z.object({
  metar: z.string().max(2000).optional(),
  metar_res: z.string().max(500).optional(),
  notam: z.string().max(4000).optional(),
  notam_res: z.string().max(1000).optional(),
  descensos: z.record(z.string(), z.string()).optional(),
  wb: z.record(z.string(), z.any()).optional(),
  maletin: z.record(z.string(), z.boolean()).optional(),
  fpl: z.record(z.string(), z.string()).optional(),
  brief: z.record(z.string(), z.boolean()).optional(),
  pax: z.string().max(10).optional(),
  obs: z.string().max(2000).optional(),
  // Orden de vuelo y bitácora: textos y nombres de la pestaña ORDEN DE VUELO.
  ov: z.record(z.string(), z.string().max(4000)).optional(),
  bitacora: z.record(z.string(), z.string().max(4000)).optional(),
  // Plan de vuelo (hoja P.V.): casillas y opciones de la pestaña 3.
  pv: z.record(z.string(), z.any()).optional(),
  // Formato de vuelo diario: cada campo del formulario es un texto.
  formato_diario: z.record(z.string(), z.string().max(1000)).optional(),
  // Maletín de vuelo: accesos directos a documentos de INFO DE VUELO (id y nombre al guardar).
  accesos_maletin: z.array(z.object({ id: z.number().int().positive(), nombre: z.string().max(255) })).max(100).optional(),
  // Datos del vuelo: fecha, código, COMEX/FINEX, tripulación y cartilla de briefing.
  datos_vuelo: z.record(z.string(), z.any()).optional(),
  // Vale de entrega: fecha, a quién se entrega y los items (el orden lo da la posición en la lista).
  vale_entrega: z
    .object({
      fecha: z.string().max(10),
      se_entrega: z.string().max(200),
      items: z
        .array(
          z.object({
            cantidad: z.string().max(20),
            material: z.string().max(200),
            observacion: z.string().max(300),
          })
        )
        .max(100),
    })
    .optional(),
  // Firma de la dotación: PNG dibujado o subido (data URL). Cadena vacía = sin firma.
  firma: z
    .string()
    .max(300000)
    .refine((s) => s === '' || s.startsWith('data:image/png;base64,'), 'La firma debe ser una imagen PNG')
    .optional(),
});

const firmaSchema = z.object({ cip: z.string().trim().min(1) });

const includeVuelo = [
  { model: Aeronave, as: 'aeronave', attributes: ['id', 'codigo'] },
  { model: Aeropuerto, as: 'origen' },
  { model: Aeropuerto, as: 'destino' },
  ...CAMPOS.map((campo) => ({
    model: Tripulante,
    as: campo,
    include: [
      { model: Grado, as: 'grado', attributes: ['id', 'nombre'] },
      { model: Funcion, as: 'funcion', attributes: ['id', 'nombre', 'puesto'] },
    ],
  })),
];

async function obtenerVuelo(id) {
  return Vuelo.findByPk(id, { include: includeVuelo });
}

async function buscarVuelo(id) {
  const vuelo = await Vuelo.findByPk(id);
  if (!vuelo) throw new HttpError(404, 'Vuelo no encontrado');
  return vuelo;
}

async function listar(req, res) {
  const where = {};
  if (req.query.fecha) where.fecha = req.query.fecha;
  // El Visualizador solo ve los vuelos ya bloqueados (firmados), como en la plantilla.
  if (req.usuario.rol === 'Visualizador') where.estado = 'locked';

  const vuelos = await Vuelo.findAll({
    where,
    include: includeVuelo,
    order: [['fecha', 'DESC'], ['horaSalida', 'ASC']],
  });
  res.json(vuelos.map(toVueloDTO));
}

async function obtener(req, res) {
  const vuelo = await obtenerVuelo(req.params.id);
  if (!vuelo) throw new HttpError(404, 'Vuelo no encontrado');
  if (req.usuario.rol === 'Visualizador' && vuelo.estado !== 'locked') {
    throw new HttpError(404, 'Vuelo no encontrado');
  }
  res.json(toVueloDTO(vuelo));
}

async function crear(req, res) {
  const datos = crearSchema.parse(req.body);
  const anio = Number(datos.fecha.slice(0, 4));

  // El número de orden es el siguiente del año; la transacción evita que dos altas tomen el mismo.
  const vuelo = await sequelize.transaction(async (transaccion) => {
    const ultimo = await Vuelo.findOne({
      where: { anioOrden: anio },
      order: [['numeroOrden', 'DESC']],
      attributes: ['numeroOrden'],
      lock: transaccion.LOCK.UPDATE,
      transaction: transaccion,
    });
    return Vuelo.create(
      {
        fecha: datos.fecha,
        horaSalida: null,
        horaLlegada: null,
        estado: 'pending',
        aeronave_id: datos.aeronave_id,
        origen_id: datos.origen_id,
        destino_id: datos.destino_id,
        numeroOrden: (ultimo ? ultimo.numeroOrden : 0) + 1,
        anioOrden: anio,
      },
      { transaction: transaccion }
    );
  });

  res.status(201).json(toVueloDTO(await obtenerVuelo(vuelo.id)));
}

async function actualizarHoras(req, res) {
  const vuelo = await buscarVuelo(req.params.id);
  if (vuelo.estado === 'locked') {
    throw new HttpError(409, 'El vuelo está bloqueado; no se pueden modificar las horas');
  }

  const datos = horasSchema.parse(req.body);
  await vuelo.update({ horaSalida: datos.hora_salida, horaLlegada: datos.hora_llegada });
  res.json(toVueloDTO(await obtenerVuelo(vuelo.id)));
}

async function actualizarRuta(req, res) {
  const vuelo = await buscarVuelo(req.params.id);
  if (vuelo.estado === 'locked') {
    throw new HttpError(409, 'El vuelo está bloqueado; no se puede modificar la aeronave ni la ruta');
  }

  const datos = rutaSchema.parse(req.body);
  const [aeronave, origen, destino] = await Promise.all([
    Aeronave.findByPk(datos.aeronave_id),
    Aeropuerto.findByPk(datos.origen_id),
    Aeropuerto.findByPk(datos.destino_id),
  ]);
  if (!aeronave) throw new HttpError(400, 'La aeronave no existe');
  if (!origen || !destino) throw new HttpError(400, 'El origen o el destino no existe');

  await vuelo.update({
    aeronave_id: datos.aeronave_id,
    origen_id: datos.origen_id,
    destino_id: datos.destino_id,
  });
  res.json(toVueloDTO(await obtenerVuelo(vuelo.id)));
}

async function actualizarDotacion(req, res) {
  const vuelo = await buscarVuelo(req.params.id);
  if (vuelo.estado === 'locked') {
    throw new HttpError(409, 'El vuelo está bloqueado; no se puede modificar la dotación');
  }

  const datos = dotacionSchema.parse(req.body);
  const ids = Object.values(datos).filter((id) => id != null);
  const tripulantes = await Tripulante.findAll({ where: { id: ids } });
  const porId = new Map(tripulantes.map((t) => [t.id, t]));

  const cambios = {};
  for (const campo of Object.keys(datos)) {
    const id = datos[campo];
    if (id === undefined) continue;

    if (id === null) {
      cambios[`${campo}_id`] = null;
      continue;
    }

    const tripulante = porId.get(id);
    if (!tripulante) throw new HttpError(400, `El tripulante ${id} no existe`);
    if (tripulante.puesto !== CAMPOS_DOTACION[campo]) {
      throw new HttpError(400, `${tripulante.nombre} no puede ocupar el puesto de ${campo}`);
    }

    cambios[`${campo}_id`] = id;
  }

  await vuelo.update(cambios);
  res.json(toVueloDTO(await obtenerVuelo(vuelo.id)));
}

async function actualizarDespacho(req, res) {
  const vuelo = await buscarVuelo(req.params.id);
  if (vuelo.estado === 'locked') {
    throw new HttpError(409, 'El vuelo está bloqueado; no se puede modificar el despacho');
  }

  const datos = despachoSchema.parse(req.body);
  // Se crea un objeto nuevo para que Sequelize detecte el cambio en la columna JSON.
  await vuelo.update({ despacho: { ...(vuelo.despacho || {}), ...datos } });
  res.json(toVueloDTO(await obtenerVuelo(vuelo.id)));
}

async function firmar(req, res) {
  const vuelo = await buscarVuelo(req.params.id);
  if (vuelo.estado === 'locked') throw new HttpError(409, 'El vuelo ya está asegurado');

  const { cip } = firmaSchema.parse(req.body);
  const usuario = await Usuario.findByPk(req.usuario.id);
  if (!usuario.cip || usuario.cip !== cip) throw new HttpError(403, 'El CIP ingresado es incorrecto');

  await vuelo.update({ estado: 'locked', firmadoPor: usuario.nombre });
  res.json(toVueloDTO(await obtenerVuelo(vuelo.id)));
}

// Solo se eliminan vuelos pendientes; los asegurados son registros históricos.
async function eliminar(req, res) {
  const vuelo = await buscarVuelo(req.params.id);
  if (vuelo.estado === 'locked') throw new HttpError(409, 'El vuelo está asegurado y no se puede eliminar');
  // Los documentos de la imagen satelital se borran en la base por cascada; también hay que borrarlos de S3.
  const imagenes = await ImagenSatelital.findAll({ where: { vueloId: vuelo.id }, attributes: ['ruta'] });
  await vuelo.destroy();
  await borrarObjetos(imagenes.map((i) => i.ruta)).catch(() => {});
  res.status(204).end();
}

async function desbloquear(req, res) {
  const vuelo = await buscarVuelo(req.params.id);
  await vuelo.update({ estado: 'pending', firmadoPor: null, enviado: false });
  res.json(toVueloDTO(await obtenerVuelo(vuelo.id)));
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizarHoras,
  actualizarRuta,
  actualizarDotacion,
  actualizarDespacho,
  firmar,
  desbloquear,
  eliminar,
};
