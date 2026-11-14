module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Archivo',
    {
      nombre: { type: DataTypes.STRING(255), allowNull: false },
      nombreOriginal: { type: DataTypes.STRING(255), allowNull: false, field: 'nombre_original' },
      ruta: { type: DataTypes.STRING(255), allowNull: false },
      mime: { type: DataTypes.STRING(120), allowNull: false },
      tamano: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      carpetaId: { type: DataTypes.INTEGER, allowNull: false, field: 'carpeta_id' },
    },
    { tableName: 'archivos_info' }
  );
