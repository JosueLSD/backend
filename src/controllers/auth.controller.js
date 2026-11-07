const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { Usuario } = require('../models');
const { toUsuarioDTO } = require('../serializers');
const HttpError = require('../utils/httpError');

const loginSchema = z.object({
  usuario: z.string().min(1),
  password: z.string().min(1),
});

async function login(req, res) {
  const { usuario, password } = loginSchema.parse(req.body);

  const user = await Usuario.findOne({ where: { usuario: usuario.trim().toLowerCase() } });
  const valido = user && (await bcrypt.compare(password.toUpperCase(), user.passwordHash));
  if (!valido) throw new HttpError(401, 'Usuario o contraseña incorrectos');

  const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

  res.json({ token, usuario: toUsuarioDTO(user) });
}

async function me(req, res) {
  const user = await Usuario.findByPk(req.usuario.id);
  if (!user) throw new HttpError(404, 'Usuario no encontrado');
  res.json(toUsuarioDTO(user));
}

module.exports = { login, me };
