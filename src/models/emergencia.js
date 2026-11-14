module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Emergencia',
    {
      numero: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
      nombre: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    },
    { tableName: 'emergencias' }
  );
