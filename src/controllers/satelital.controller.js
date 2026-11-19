const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const { sequelize, Vuelo, ImagenSatelital } = require('../models');
const HttpError = require('../utils/httpError');
const { subirObjeto, borrarObjetos, descargarObjeto } = require('../utils/s3');

// Documentos de la imagen satelital (paso 5 del despacho): PDF o imagen, hasta 20 por subida.
const TAMANO_MAX = 50 * 1024 * 1024;
const MAX_ARCHIVOS = 20;
const TIPOS_PERMITIDOS = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANO_MAX, files: MAX_ARCHIVOS },
  fileFilter: (req, file, cb) => {
    if (TIPOS_PERMITIDOS.has(file.mimetype)) return cb(null, true);
    cb(new HttpError(400, `Tipo de archivo no permitido (${file.mimetype})`));
  },
});

// Convierte los errores de multer en respuestas 400 claras.
function recibirArchivos(req, res, next) {
  upload.array('archivos', MAX_ARCHIVOS)(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') return next(new HttpError(400, 'Cada documento puede pesar hasta 50 MB'));
    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new HttpError(400, `Puede subir hasta ${MAX_ARCHIVOS} documentos a la vez`));
    }
    next(err.status ? err : new HttpError(400, 'No se pudieron recibir los documentos'));
  });
}

async function buscarVuelo(req) {
  const id = Number(req.params.id);
  const vuelo = Number.isInteger(id) ? await Vuelo.findByPk(id) : null;
  if (!vuelo) throw new HttpError(404, 'Vuelo no encontrado');
  return vuelo;
}

// Lo que muestra el visor: los documentos visibles, con su enlace temporal.
async function listar(vueloId) {
  const imagenes = await ImagenSatelital.findAll({
    where: { vueloId, visible: true },
    order: [['id', 'ASC']],
  });
  const archivos = await Promise.all(
    imagenes.map(async (i) => ({
      id: i.id,
      nombre: i.nombre,
      mime: i.mime,
      nuevo: i.nuevo,
    }))
  );
  return { archivos, pendientes: imagenes.filter((i) => i.nuevo).length };
}

async function obtener(req, res) {
  const vuelo = await buscarVuelo(req);
  if (req.usuario.rol === 'Visualizador' && vuelo.estado !== 'locked') {
    throw new HttpError(404, 'Vuelo no encontrado');
  }
  res.json(await listar(vuelo.id));
}

// Contenido de un documento visible. Se entrega por la API (no por S3) para que el navegador
// pueda guardarlo y mostrarlo sin conexión.
async function contenido(req, res) {
  const vuelo = await buscarVuelo(req);
  if (req.usuario.rol === 'Visualizador' && vuelo.estado !== 'locked') {
    throw new HttpError(404, 'Vuelo no encontrado');
  }
  const imagen = await ImagenSatelital.findOne({
    where: { id: Number(req.params.archivoId), vueloId: vuelo.id, visible: true },
  });
  if (!imagen) throw new HttpError(404, 'Documento no encontrado');
  const cuerpo = await descargarObjeto(imagen.ruta);
  res.setHeader('Content-Type', imagen.mime);
  res.setHeader('Cache-Control', 'private, max-age=86400');
  res.send(cuerpo);
}

// Agrega documentos. Los nuevos quedan visibles junto a los que ya había.
async function subir(req, res) {
  const vuelo = await buscarVuelo(req);
  if (vuelo.estado === 'locked') throw new HttpError(409, 'El vuelo está asegurado; no se pueden cambiar las imágenes');
  if (!req.files || !req.files.length) throw new HttpError(400, 'Seleccione al menos un documento');

  const claves = [];
  try {
    await sequelize.transaction(async (transaccion) => {
      for (const archivo of req.files) {
        // Multer entrega el nombre en latin1; se pasa a UTF-8 para conservar tildes.
        const original = Buffer.from(archivo.originalname, 'latin1').toString('utf8');
        const clave = crypto.randomBytes(16).toString('hex') + path.extname(original).toLowerCase();
        const ruta = await subirObjeto(clave, archivo.buffer, archivo.mimetype);
        claves.push(ruta);
        await ImagenSatelital.create(
          {
            vueloId: vuelo.id,
            nombre: original,
            ruta,
            mime: archivo.mimetype,
            tamano: archivo.size,
            visible: true,
            nuevo: true,
          },
          { transaction: transaccion }
        );
      }
    });
  } catch (err) {
    // Si algo falla, no quedan objetos huérfanos en S3.
    await borrarObjetos(claves).catch(() => {});
    throw err;
  }

  res.json(await listar(vuelo.id));
}

// Limpiar: borra todos los documentos del vuelo (base y S3).
async function limpiar(req, res) {
  const vuelo = await buscarVuelo(req);
  if (vuelo.estado === 'locked') throw new HttpError(409, 'El vuelo está asegurado; no se pueden cambiar las imágenes');

  const imagenes = await ImagenSatelital.findAll({ where: { vueloId: vuelo.id }, attributes: ['ruta'] });
  await ImagenSatelital.destroy({ where: { vueloId: vuelo.id } });
  await borrarObjetos(imagenes.map((i) => i.ruta)).catch(() => {});
  res.status(204).end();
}

module.exports = { recibirArchivos, obtener, subir, limpiar, contenido };
