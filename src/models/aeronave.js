module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Aeronave',
    {
      codigo: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: 'aeronaves' }
  );
