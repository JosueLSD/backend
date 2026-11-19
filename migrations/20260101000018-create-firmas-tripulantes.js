'use strict';

// Firma de cada tripulante (PNG en data URL). Va en tabla aparte para no cargarla en los listados de dotación.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('firmas_tripulantes', {
      tripulante_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: { model: 'tripulantes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      firma: { type: Sequelize.TEXT('medium'), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('firmas_tripulantes');
  },
};
