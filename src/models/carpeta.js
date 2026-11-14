module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Carpeta',
    {
      nombre: { type: DataTypes.STRING(120), allowNull: false },
      icono: { type: DataTypes.STRING(60), allowNull: false, defaultValue: 'folder' },
      padreId: { type: DataTypes.INTEGER, allowNull: true, field: 'padre_id' },
    },
    { tableName: 'carpetas_info' }
  );
