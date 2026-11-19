module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'FirmaTripulante',
    {
      tripulanteId: { type: DataTypes.INTEGER, primaryKey: true, field: 'tripulante_id' },
      firma: { type: DataTypes.TEXT('medium'), allowNull: false },
    },
    { tableName: 'firmas_tripulantes' }
  );
