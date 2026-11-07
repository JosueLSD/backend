'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('vuelos', 'despacho', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('vuelos', 'enviado', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('vuelos', 'firmado_por', {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('vuelos', 'firmado_por');
    await queryInterface.removeColumn('vuelos', 'enviado');
    await queryInterface.removeColumn('vuelos', 'despacho');
  },
};
