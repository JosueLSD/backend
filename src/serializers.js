const { CAMPOS_DOTACION } = require('./constants');

const CAMPOS = Object.keys(CAMPOS_DOTACION);

const toUsuarioDTO = (u) => ({
  id: u.id,
  usuario: u.usuario,
  nombre: u.nombre,
  rol: u.rol,
  cip: u.cip,
});

const toTripulanteDTO = (t) => ({
  id: t.id,
  grado: t.grado ? t.grado.nombre : null,
  nombre: t.nombre,
  puesto: t.puesto,
  clasificacion: t.clasificacion,
  cip: t.cip,
  celular: t.celular,
  horas: t.horas,
  funcion: t.funcion ? t.funcion.nombre : null,
});

const toAeropuertoDTO = (a) => ({
  id: a.id,
  codigo: a.codigo,
  nombre: a.nombre,
  elevacion: a.elevacion,
  twr: a.twr,
  pista: a.pista,
});

const toVueloDTO = (v) => ({
  id: v.id,
  fecha: v.fecha,
  estado: v.estado,
  horaSalida: v.horaSalida,
  horaLlegada: v.horaLlegada,
  aeronave: v.aeronave ? { id: v.aeronave.id, codigo: v.aeronave.codigo } : null,
  origen: v.origen ? toAeropuertoDTO(v.origen) : null,
  destino: v.destino ? toAeropuertoDTO(v.destino) : null,
  dotacion: Object.fromEntries(CAMPOS.map((campo) => [campo, v[campo] ? toTripulanteDTO(v[campo]) : null])),
  despacho: v.despacho || {},
  enviado: v.enviado,
  firmadoPor: v.firmadoPor,
});

module.exports = { toUsuarioDTO, toTripulanteDTO, toAeropuertoDTO, toVueloDTO };
