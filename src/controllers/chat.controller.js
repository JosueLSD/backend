const { z } = require('zod');
const { Op } = require('sequelize');
const { Mensaje, ChatLectura, Usuario } = require('../models');

const MENSAJES_INICIALES = 50;
const MENSAJES_POR_CONSULTA = 100;

const enviarSchema = z.object({ texto: z.string().trim().min(1, 'Escriba un mensaje').max(1000) });
const leerSchema = z.object({ hasta: z.number().int().nonnegative() });

const incluirAutor = [{ model: Usuario, as: 'autor', attributes: ['id', 'nombre', 'rol'] }];

function toDTO(m, miId) {
  return {
    id: m.id,
    texto: m.texto,
    creado: m.createdAt,
    autor: m.autor ? m.autor.nombre : 'Usuario eliminado',
    rol: m.autor ? m.autor.rol : '',
    propio: m.usuarioId === miId,
  };
}

// Sin "desde": los últimos mensajes. Con "desde": los mensajes posteriores a ese id (para el sondeo).
// "noLeidos" cuenta los mensajes de otros usuarios posteriores a lo que este usuario ya leyó.
async function listar(req, res) {
  const miId = req.usuario.id;
  const desde = Number(req.query.desde) || 0;

  let mensajes;
  if (desde) {
    mensajes = await Mensaje.findAll({
      where: { id: { [Op.gt]: desde } },
      include: incluirAutor,
      order: [['id', 'ASC']],
      limit: MENSAJES_POR_CONSULTA,
    });
  } else {
    mensajes = (await Mensaje.findAll({
      include: incluirAutor,
      order: [['id', 'DESC']],
      limit: MENSAJES_INICIALES,
    })).reverse();
  }

  const lectura = await ChatLectura.findByPk(miId);
  const noLeidos = await Mensaje.count({
    where: {
      id: { [Op.gt]: lectura ? lectura.ultimoLeidoId : 0 },
      usuarioId: { [Op.ne]: miId },
    },
  });

  res.json({ mensajes: mensajes.map((m) => toDTO(m, miId)), noLeidos });
}

async function enviar(req, res) {
  const { texto } = enviarSchema.parse(req.body);
  const miId = req.usuario.id;
  const mensaje = await Mensaje.create({ usuarioId: miId, texto });
  // Lo propio ya está leído.
  await marcarHasta(miId, mensaje.id);
  const completo = await Mensaje.findByPk(mensaje.id, { include: incluirAutor });
  res.status(201).json(toDTO(completo, miId));
}

// Solo avanza la lectura: nunca retrocede.
async function marcarHasta(usuarioId, hasta) {
  const [lectura] = await ChatLectura.findOrCreate({
    where: { usuarioId },
    defaults: { usuarioId, ultimoLeidoId: 0 },
  });
  if (hasta > lectura.ultimoLeidoId) await lectura.update({ ultimoLeidoId: hasta });
}

async function leer(req, res) {
  const { hasta } = leerSchema.parse(req.body);
  await marcarHasta(req.usuario.id, hasta);
  res.status(204).end();
}

module.exports = { listar, enviar, leer };
