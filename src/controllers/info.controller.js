const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { z } = require('zod');
const { Carpeta, Archivo, Enlace } = require('../models');
const HttpError = require('../utils/httpError');

// Archivos subidos al explorador de información de vuelo. Viven en disco; la base guarda su ubicación.
const UPLOAD_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');
const TAMANO_MAX = 50 * 1024 * 1024;

const TIPOS_PERMITIDOS = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/xml',
  'text/xml',
  'application/json',
  'application/vnd.google-earth.kml+xml',
  'application/octet-stream',
]);

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const almacen = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + path.extname(file.originalname).toLowerCase()),
});

const upload = multer({
  storage: almacen,
  limits: { fileSize: TAMANO_MAX },
  fileFilter: (req, file, cb) => {
    if (TIPOS_PERMITIDOS.has(file.mimetype)) return cb(null, true);
    cb(new HttpError(400, `Tipo de archivo no permitido (${file.mimetype})`));
  },
});

// Middleware de subida que convierte los errores de multer en respuestas 400 claras.
function recibirArchivo(req, res, next) {
  upload.single('archivo')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') return next(new HttpError(400, 'El archivo supera los 50 MB'));
    next(err.status ? err : new HttpError(400, 'No se pudo recibir el archivo'));
  });
}

const idSchema = z.number().int().positive();
const nombreSchema = z.string().trim().min(1, 'El nombre es obligatorio').max(120);
const iconoSchema = z.string().regex(/^[a-z0-9-]{1,60}$/, 'Icono inválido');

const crearCarpetaSchema = z.object({
  nombre: nombreSchema,
  icono: iconoSchema,
  padreId: idSchema.nullable().optional(),
});

const actualizarCarpetaSchema = z
  .object({ nombre: nombreSchema.optional(), icono: iconoSchema.optional() })
  .refine((d) => d.nombre !== undefined || d.icono !== undefined, { message: 'Nada que actualizar' });

const renombrarArchivoSchema = z.object({ nombre: nombreSchema });

const enlaceSchema = z.object({
  titulo: z.string().trim().min(1).max(80),
  descripcion: z.string().trim().min(1).max(160),
  url: z
    .url('La dirección no es válida')
    .max(500)
    .refine((u) => /^https?:\/\//i.test(u), 'La dirección debe empezar con http:// o https://'),
});

const dtoCarpeta = (c) => ({ id: c.id, nombre: c.nombre, icono: c.icono, padreId: c.padreId });
const dtoArchivo = (a) => ({
  id: a.id,
  nombre: a.nombre,
  mime: a.mime,
  tamano: a.tamano,
  actualizado: a.updatedAt,
});
const dtoEnlace = (e) => ({ clave: e.clave, titulo: e.titulo, descripcion: e.descripcion, url: e.url });

async function buscarCarpeta(id) {
  const carpeta = await Carpeta.findByPk(id);
  if (!carpeta) throw new HttpError(404, 'La carpeta no existe');
  return carpeta;
}

async function buscarArchivo(id) {
  const archivo = await Archivo.findByPk(id);
  if (!archivo) throw new HttpError(404, 'El archivo no existe');
  return archivo;
}

// Ids de una carpeta y de todas sus subcarpetas.
async function idsDelArbol(raiz) {
  const ids = [raiz];
  let frontera = [raiz];
  while (frontera.length) {
    const hijos = await Carpeta.findAll({ where: { padreId: frontera }, attributes: ['id'] });
    frontera = hijos.map((h) => h.id);
    ids.push(...frontera);
  }
  return ids;
}

function borrarEnDisco(ruta) {
  fs.unlink(path.join(UPLOAD_DIR, ruta), () => {});
}

// Contenido de una carpeta (o de la raíz): subcarpetas, archivos y la ruta para el encabezado.
async function explorar(req, res) {
  const carpetaId = req.query.carpeta ? idSchema.parse(Number(req.query.carpeta)) : null;

  const ruta = [];
  let actual = null;
  if (carpetaId) {
    actual = await buscarCarpeta(carpetaId);
    let nodo = actual;
    while (nodo) {
      ruta.unshift({ id: nodo.id, nombre: nodo.nombre });
      nodo = nodo.padreId ? await Carpeta.findByPk(nodo.padreId) : null;
    }
  }

  const [carpetas, archivos] = await Promise.all([
    Carpeta.findAll({ where: { padreId: carpetaId }, order: [['id', 'ASC']] }),
    carpetaId
      ? Archivo.findAll({ where: { carpetaId }, order: [['nombre', 'ASC']] })
      : Promise.resolve([]),
  ]);

  res.json({
    carpeta: actual ? dtoCarpeta(actual) : null,
    ruta,
    carpetas: carpetas.map(dtoCarpeta),
    archivos: archivos.map(dtoArchivo),
  });
}

async function crearCarpeta(req, res) {
  const datos = crearCarpetaSchema.parse(req.body);
  if (datos.padreId) await buscarCarpeta(datos.padreId);

  const carpeta = await Carpeta.create({
    nombre: datos.nombre,
    icono: datos.icono,
    padreId: datos.padreId || null,
  });
  res.status(201).json(dtoCarpeta(carpeta));
}

async function actualizarCarpeta(req, res) {
  const carpeta = await buscarCarpeta(idSchema.parse(Number(req.params.id)));
  const datos = actualizarCarpetaSchema.parse(req.body);
  await carpeta.update(datos);
  res.json(dtoCarpeta(carpeta));
}

// Borra la carpeta con sus subcarpetas y archivos (los archivos también del disco).
async function eliminarCarpeta(req, res) {
  const carpeta = await buscarCarpeta(idSchema.parse(Number(req.params.id)));
  const ids = await idsDelArbol(carpeta.id);

  const archivos = await Archivo.findAll({ where: { carpetaId: ids }, attributes: ['ruta'] });
  archivos.forEach((a) => borrarEnDisco(a.ruta));

  await Carpeta.destroy({ where: { id: ids } });
  res.status(204).end();
}

async function subirArchivo(req, res) {
  if (!req.file) throw new HttpError(400, 'Seleccione un archivo');

  const carpetaId = idSchema.parse(Number(req.body.carpetaId));
  try {
    await buscarCarpeta(carpetaId);
    // Multer entrega el nombre en latin1; se convierte a UTF-8 para conservar tildes y eñes.
    const original = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    const archivo = await Archivo.create({
      nombre: original,
      nombreOriginal: original,
      ruta: req.file.filename,
      mime: req.file.mimetype,
      tamano: req.file.size,
      carpetaId,
    });
    res.status(201).json(dtoArchivo(archivo));
  } catch (err) {
    borrarEnDisco(req.file.filename);
    throw err;
  }
}

async function renombrarArchivo(req, res) {
  const archivo = await buscarArchivo(idSchema.parse(Number(req.params.id)));
  const datos = renombrarArchivoSchema.parse(req.body);
  await archivo.update({ nombre: datos.nombre });
  res.json(dtoArchivo(archivo));
}

async function eliminarArchivo(req, res) {
  const archivo = await buscarArchivo(idSchema.parse(Number(req.params.id)));
  borrarEnDisco(archivo.ruta);
  await archivo.destroy();
  res.status(204).end();
}

// Entrega el archivo. Se pide con el token en la cabecera, así que el frontend lo descarga como blob.
async function descargarArchivo(req, res) {
  const archivo = await buscarArchivo(idSchema.parse(Number(req.params.id)));
  const ruta = path.join(UPLOAD_DIR, archivo.ruta);
  if (!fs.existsSync(ruta)) throw new HttpError(404, 'El archivo no se encuentra en el servidor');

  const extension = path.extname(archivo.nombreOriginal);
  const nombre = path.extname(archivo.nombre) ? archivo.nombre : archivo.nombre + extension;
  res.setHeader('Content-Type', archivo.mime);
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(nombre)}`);
  res.sendFile(ruta);
}

async function listarEnlaces(req, res) {
  const enlaces = await Enlace.findAll({ order: [['id', 'ASC']] });
  res.json(enlaces.map(dtoEnlace));
}

async function actualizarEnlace(req, res) {
  const enlace = await Enlace.findOne({ where: { clave: req.params.clave } });
  if (!enlace) throw new HttpError(404, 'El enlace no existe');
  const datos = enlaceSchema.parse(req.body);
  await enlace.update(datos);
  res.json(dtoEnlace(enlace));
}

module.exports = {
  recibirArchivo,
  explorar,
  crearCarpeta,
  actualizarCarpeta,
  eliminarCarpeta,
  subirArchivo,
  renombrarArchivo,
  eliminarArchivo,
  descargarArchivo,
  listarEnlaces,
  actualizarEnlace,
};
