module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Grado',
    {
      nombre: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    },
    { tableName: 'grados' }
  );
