const { ROLES } = require('../constants');

module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Usuario',
    {
      usuario: { type: DataTypes.STRING(60), allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING(100), allowNull: false },
      nombre: { type: DataTypes.STRING(120), allowNull: false },
      rol: { type: DataTypes.ENUM(...ROLES), allowNull: false },
      cip: { type: DataTypes.STRING(20), allowNull: true },
    },
    { tableName: 'usuarios' }
  );
