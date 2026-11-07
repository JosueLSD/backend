'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('aeropuertos', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      codigo: { type: Sequelize.STRING(4), allowNull: false, unique: true },
      nombre: { type: Sequelize.STRING(120), allowNull: false },
      elevacion: { type: Sequelize.STRING(30), allowNull: true },
      twr: { type: Sequelize.STRING(20), allowNull: true },
      pista: { type: Sequelize.STRING(10), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('aeropuertos');
  },
};
