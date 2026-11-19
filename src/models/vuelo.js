module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Vuelo',
    {
      fecha: { type: DataTypes.DATEONLY, allowNull: false },
      horaSalida: { type: DataTypes.STRING(5), allowNull: true },
      horaLlegada: { type: DataTypes.STRING(5), allowNull: true },
      estado: { type: DataTypes.ENUM('pending', 'locked'), allowNull: false, defaultValue: 'pending' },
      // Pasos 3 a 9 del despacho (METAR, NOTAM, descensos, peso y balance, etc.) más pax y observaciones.
      despacho: { type: DataTypes.JSON, allowNull: true },
      enviado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      firmadoPor: { type: DataTypes.STRING(120), allowNull: true },
      // Número de orden correlativo por año (001-2026). Lo asigna el servidor al crear el vuelo.
      numeroOrden: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      anioOrden: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: true },
    },
    { tableName: 'vuelos' }
  );
