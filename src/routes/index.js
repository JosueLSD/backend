const { Router } = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const auth = require('../controllers/auth.controller');
const usuarios = require('../controllers/usuarios.controller');
const tripulantes = require('../controllers/tripulantes.controller');
const grados = require('../controllers/grados.controller');
const funciones = require('../controllers/funciones.controller');
const aeronaves = require('../controllers/aeronaves.controller');
const aeropuertos = require('../controllers/aeropuertos.controller');
const vuelos = require('../controllers/vuelos.controller');
const info = require('../controllers/info.controller');
const emergencias = require('../controllers/emergencias.controller');
const catalogos = require('../controllers/catalogos.controller');

const router = Router();

const ADMIN = 'Administrador';
const DESPACHO = ['Administrador', 'Despachador'];

// Autenticación
router.post('/auth/login', auth.login);
router.get('/auth/me', authenticate, auth.me);

// Usuarios del sistema (solo administradores)
router.get('/usuarios', authenticate, authorize(ADMIN), usuarios.listar);
router.post('/usuarios', authenticate, authorize(ADMIN), usuarios.crear);
router.put('/usuarios/:id', authenticate, authorize(ADMIN), usuarios.actualizar);
router.delete('/usuarios/:id', authenticate, authorize(ADMIN), usuarios.eliminar);

// Dotación: tripulantes (no son usuarios)
router.get('/tripulantes', authenticate, tripulantes.listar);
router.post('/tripulantes', authenticate, authorize(ADMIN), tripulantes.crear);
router.put('/tripulantes/:id', authenticate, authorize(ADMIN), tripulantes.actualizar);
router.delete('/tripulantes/:id', authenticate, authorize(ADMIN), tripulantes.eliminar);

// Catálogos para los selects
router.get('/grados', authenticate, grados.listar);
router.get('/funciones', authenticate, funciones.listar);
router.get('/aeronaves', authenticate, aeronaves.listar);
router.post('/aeronaves', authenticate, authorize(ADMIN), aeronaves.crear);
router.get('/aeropuertos', authenticate, aeropuertos.listar);
router.post('/aeropuertos', authenticate, authorize(ADMIN), aeropuertos.crear);

// Vuelos. Editar el despacho es para todos menos el Visualizador, como en la plantilla.
const EDITORES = ['Administrador', 'Piloto', 'Despachador'];

router.get('/vuelos', authenticate, vuelos.listar);
router.post('/vuelos', authenticate, authorize(...DESPACHO), vuelos.crear);
router.get('/vuelos/:id', authenticate, vuelos.obtener);
router.put('/vuelos/:id/horas', authenticate, authorize(...EDITORES), vuelos.actualizarHoras);
router.put('/vuelos/:id/ruta', authenticate, authorize(...EDITORES), vuelos.actualizarRuta);
router.put('/vuelos/:id/dotacion', authenticate, authorize(...EDITORES), vuelos.actualizarDotacion);
router.put('/vuelos/:id/despacho', authenticate, authorize(...EDITORES), vuelos.actualizarDespacho);
router.post('/vuelos/:id/firma', authenticate, authorize('Administrador', 'Piloto'), vuelos.firmar);
router.post('/vuelos/:id/desbloquear', authenticate, authorize(ADMIN), vuelos.desbloquear);

// Tabla maestra de emergencias (orden de vuelo).
router.get('/emergencias', authenticate, emergencias.listar);

// Tablas maestras del plan de vuelo.
router.get('/catalogos', authenticate, catalogos.listar);

// Información de vuelo: explorador de carpetas y archivos, y enlaces de los cuadros inferiores.
// Todos ven la información; Administrador y Despachador la modifican.
router.get('/info/explorar', authenticate, info.explorar);
router.post('/info/carpetas', authenticate, authorize(...DESPACHO), info.crearCarpeta);
router.put('/info/carpetas/:id', authenticate, authorize(...DESPACHO), info.actualizarCarpeta);
router.delete('/info/carpetas/:id', authenticate, authorize(...DESPACHO), info.eliminarCarpeta);
router.post('/info/archivos', authenticate, authorize(...DESPACHO), info.recibirArchivo, info.subirArchivo);
router.put('/info/archivos/:id', authenticate, authorize(...DESPACHO), info.renombrarArchivo);
router.delete('/info/archivos/:id', authenticate, authorize(...DESPACHO), info.eliminarArchivo);
router.get('/info/archivos/:id/url', authenticate, info.urlArchivo);
router.get('/info/enlaces', authenticate, info.listarEnlaces);
router.put('/info/enlaces/:clave', authenticate, authorize(...DESPACHO), info.actualizarEnlace);

module.exports = router;
