'use strict';

// Las horas de salida y llegada se llenan después, en el paso CONFECCIÓN, y no al crear el vuelo.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('vuelos', 'hora_salida', {
      type: Sequelize.STRING(5),
      allowNull: true,
    });
    await queryInterface.changeColumn('vuelos', 'hora_llegada', {
      type: Sequelize.STRING(5),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Falla si hay vuelos sin horas; hay que completarlas antes de revertir.
    await queryInterface.changeColumn('vuelos', 'hora_salida', {
      type: Sequelize.STRING(5),
      allowNull: false,
    });
    await queryInterface.changeColumn('vuelos', 'hora_llegada', {
      type: Sequelize.STRING(5),
      allowNull: false,
    });
  },
};
