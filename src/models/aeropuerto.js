module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Aeropuerto',
    {
      codigo: { type: DataTypes.STRING(4), allowNull: false, unique: true },
      nombre: { type: DataTypes.STRING(120), allowNull: false },
      elevacion: { type: DataTypes.STRING(30), allowNull: true },
      twr: { type: DataTypes.STRING(20), allowNull: true },
      pista: { type: DataTypes.STRING(10), allowNull: true },
    },
    { tableName: 'aeropuertos' }
  );
