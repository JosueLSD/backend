'use strict';

// Puestos de la dotación usados al momento de crear la tabla (para poder revertir el cambio).
const PUESTOS = [
  'Pilotos',
  'Copilotos',
  'Mecanicos',
  'Coordinador Tactico',
  'Sensorista',
  'Cargomaster',
  'Artillero',
  'Otros',
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('tripulantes', 'puesto', {
      type: Sequelize.STRING(60),
      allowNull: false,
    });
    await queryInterface.changeColumn('funciones', 'puesto', {
      type: Sequelize.STRING(60),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('tripulantes', 'puesto', {
      type: Sequelize.ENUM(...PUESTOS),
      allowNull: false,
    });
    await queryInterface.changeColumn('funciones', 'puesto', {
      type: Sequelize.ENUM(...PUESTOS),
      allowNull: true,
    });
  },
};
