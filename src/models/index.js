const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');
const { CAMPOS_DOTACION } = require('../constants');

const env = process.env.NODE_ENV || 'development';
const { database, username, password, ...options } = config[env];
const sequelize = new Sequelize(database, username, password, options);

const Usuario = require('./usuario')(sequelize, DataTypes);
const Grado = require('./grado')(sequelize, DataTypes);
const Funcion = require('./funcion')(sequelize, DataTypes);
const Tripulante = require('./tripulante')(sequelize, DataTypes);
const Aeronave = require('./aeronave')(sequelize, DataTypes);
const Aeropuerto = require('./aeropuerto')(sequelize, DataTypes);
const Vuelo = require('./vuelo')(sequelize, DataTypes);
const Carpeta = require('./carpeta')(sequelize, DataTypes);
const Archivo = require('./archivo')(sequelize, DataTypes);
const Enlace = require('./enlace')(sequelize, DataTypes);
const Emergencia = require('./emergencia')(sequelize, DataTypes);
const Catalogo = require('./catalogo')(sequelize, DataTypes);
const ImagenSatelital = require('./imagenSatelital')(sequelize, DataTypes);
const Mensaje = require('./mensaje')(sequelize, DataTypes);
const ChatLectura = require('./chatLectura')(sequelize, DataTypes);

Tripulante.belongsTo(Grado, { as: 'grado', foreignKey: 'grado_id' });
Tripulante.belongsTo(Funcion, { as: 'funcion', foreignKey: 'funcion_id' });

Vuelo.belongsTo(Aeronave, { as: 'aeronave', foreignKey: 'aeronave_id' });
Vuelo.belongsTo(Aeropuerto, { as: 'origen', foreignKey: 'origen_id' });
Vuelo.belongsTo(Aeropuerto, { as: 'destino', foreignKey: 'destino_id' });
for (const campo of Object.keys(CAMPOS_DOTACION)) {
  Vuelo.belongsTo(Tripulante, { as: campo, foreignKey: `${campo}_id` });
}

// Carpetas anidadas: una carpeta puede tener subcarpetas y archivos.
Carpeta.hasMany(Carpeta, { as: 'subcarpetas', foreignKey: 'padreId' });
Carpeta.belongsTo(Carpeta, { as: 'padre', foreignKey: 'padreId' });
Carpeta.hasMany(Archivo, { as: 'archivos', foreignKey: 'carpetaId' });
Archivo.belongsTo(Carpeta, { as: 'carpeta', foreignKey: 'carpetaId' });

// Imagen satelital: documentos de cada vuelo. Al borrar el vuelo se borran también sus documentos.
Vuelo.hasMany(ImagenSatelital, { as: 'imagenesSatelitales', foreignKey: 'vueloId', onDelete: 'CASCADE' });
ImagenSatelital.belongsTo(Vuelo, { as: 'vuelo', foreignKey: 'vueloId' });

// Chat: cada mensaje tiene su autor.
Mensaje.belongsTo(Usuario, { as: 'autor', foreignKey: 'usuarioId' });

module.exports = { Mensaje, ChatLectura, sequelize, Usuario, Grado, Funcion, Tripulante, Aeronave, Aeropuerto, Vuelo, Carpeta, Archivo, Enlace, Emergencia, Catalogo, ImagenSatelital };
