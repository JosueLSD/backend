module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'ImagenSatelital',
    {
      vueloId: { type: DataTypes.INTEGER, allowNull: false, field: 'vuelo_id' },
      nombre: { type: DataTypes.STRING(255), allowNull: false },
      ruta: { type: DataTypes.STRING(255), allowNull: false },
      mime: { type: DataTypes.STRING(120), allowNull: false },
      tamano: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      visible: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      nuevo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: 'imagenes_satelitales' }
  );
