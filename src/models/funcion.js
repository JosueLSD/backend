module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Funcion',
    {
      nombre: { type: DataTypes.STRING(60), allowNull: false, unique: true },
      // Puesto al que pertenece la función. Si es null, la función es libre y se elige en el puesto Otros.
      puesto: { type: DataTypes.STRING(60), allowNull: true },
    },
    { tableName: 'funciones' }
  );
