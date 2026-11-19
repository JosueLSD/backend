module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'ChatLectura',
    {
      usuarioId: { type: DataTypes.INTEGER, primaryKey: true, field: 'usuario_id' },
      ultimoLeidoId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, field: 'ultimo_leido_id' },
    },
    { tableName: 'chat_lecturas' }
  );
