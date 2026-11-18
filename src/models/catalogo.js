module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Catalogo',
    {
      tipo: { type: DataTypes.STRING(40), allowNull: false },
      codigo: { type: DataTypes.STRING(20), allowNull: false },
      descripcion: { type: DataTypes.STRING(255), allowNull: false },
      orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    { tableName: 'catalogos' }
  );
