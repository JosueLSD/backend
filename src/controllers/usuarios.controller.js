const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { Usuario } = require('../models');
const { ROLES } = require('../constants');
const { toUsuarioDTO } = require('../serializers');
const HttpError = require('../utils/httpError');

const crearSchema = z.object({
  usuario: z.string().trim().toLowerCase().min(3).max(60),
  password: z.string().min(4).max(60),
  nombre: z.string().trim().min(1).max(120),
  rol: z.enum(ROLES),
  cip: z.string().trim().max(20).nullable().optional(),
});

const actualizarSchema = crearSchema.partial();

// Igual que la plantilla, la contraseña se compara en mayúsculas.
const hashPassword = (password) => bcrypt.hash(password.toUpperCase(), 10);

async function listar(req, res) {
  const usuarios = await Usuario.findAll({ order: [['usuario', 'ASC']] });
  res.json(usuarios.map(toUsuarioDTO));
}

async function crear(req, res) {
  const { password, ...datos } = crearSchema.parse(req.body);
  const usuario = await Usuario.create({
    ...datos,
    cip: datos.cip ?? null,
    passwordHash: await hashPassword(password),
  });
  res.status(201).json(toUsuarioDTO(usuario));
}

async function actualizar(req, res) {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) throw new HttpError(404, 'Usuario no encontrado');

  const { password, ...datos } = actualizarSchema.parse(req.body);
  if (password) datos.passwordHash = await hashPassword(password);

  await usuario.update(datos);
  res.json(toUsuarioDTO(usuario));
}

async function eliminar(req, res) {
  if (Number(req.params.id) === req.usuario.id) {
    throw new HttpError(400, 'No puede eliminar su propio usuario');
  }

  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) throw new HttpError(404, 'Usuario no encontrado');

  await usuario.destroy();
  res.status(204).end();
}

module.exports = { listar, crear, actualizar, eliminar };
