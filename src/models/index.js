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

Tripulante.belongsTo(Grado, { as: 'grado', foreignKey: 'grado_id' });
Tripulante.belongsTo(Funcion, { as: 'funcion', foreignKey: 'funcion_id' });

Vuelo.belongsTo(Aeronave, { as: 'aeronave', foreignKey: 'aeronave_id' });
Vuelo.belongsTo(Aeropuerto, { as: 'origen', foreignKey: 'origen_id' });
Vuelo.belongsTo(Aeropuerto, { as: 'destino', foreignKey: 'destino_id' });
for (const campo of Object.keys(CAMPOS_DOTACION)) {
  Vuelo.belongsTo(Tripulante, { as: campo, foreignKey: `${campo}_id` });
}

module.exports = { sequelize, Usuario, Grado, Funcion, Tripulante, Aeronave, Aeropuerto, Vuelo };
