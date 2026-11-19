module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Mensaje',
    {
      usuarioId: { type: DataTypes.INTEGER, allowNull: false, field: 'usuario_id' },
      texto: { type: DataTypes.STRING(1000), allowNull: false },
    },
    { tableName: 'mensajes_chat' }
  );
