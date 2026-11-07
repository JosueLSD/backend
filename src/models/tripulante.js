module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Tripulante',
    {
      nombre: { type: DataTypes.STRING(120), allowNull: false },
      puesto: { type: DataTypes.STRING(60), allowNull: false },
      clasificacion: { type: DataTypes.STRING(60), allowNull: true },
      cip: { type: DataTypes.STRING(20), allowNull: true },
      celular: { type: DataTypes.STRING(20), allowNull: true },
      horas: { type: DataTypes.STRING(20), allowNull: true },
    },
    { tableName: 'tripulantes' }
  );
