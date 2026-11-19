'use strict';

// Número de orden de la orden de vuelo: correlativo por año (001-2026, 002-2026, ...).
// Se asigna al crear el vuelo. Los vuelos que ya existían se numeran por fecha.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('vuelos', 'numero_orden', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
    });
    await queryInterface.addColumn('vuelos', 'anio_orden', {
      type: Sequelize.SMALLINT.UNSIGNED,
      allowNull: true,
    });
    await queryInterface.addIndex('vuelos', ['anio_orden', 'numero_orden'], {
      unique: true,
      name: 'vuelos_numero_orden_anio_unico',
    });

    // Numeración de los vuelos existentes: por año de la fecha, en orden de fecha y de alta.
    const [vuelos] = await queryInterface.sequelize.query(
      'SELECT id, fecha FROM vuelos ORDER BY fecha ASC, id ASC'
    );
    const contadores = {};
    for (const vuelo of vuelos) {
      const anio = String(vuelo.fecha).slice(0, 4);
      contadores[anio] = (contadores[anio] || 0) + 1;
      await queryInterface.bulkUpdate(
        'vuelos',
        { numero_orden: contadores[anio], anio_orden: Number(anio) },
        { id: vuelo.id }
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('vuelos', 'vuelos_numero_orden_anio_unico');
    await queryInterface.removeColumn('vuelos', 'anio_orden');
    await queryInterface.removeColumn('vuelos', 'numero_orden');
  },
};
