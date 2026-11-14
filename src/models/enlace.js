module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Enlace',
    {
      clave: { type: DataTypes.STRING(40), allowNull: false, unique: true },
      titulo: { type: DataTypes.STRING(80), allowNull: false },
      descripcion: { type: DataTypes.STRING(160), allowNull: false },
      url: { type: DataTypes.STRING(500), allowNull: false },
    },
    { tableName: 'enlaces_info' }
  );
