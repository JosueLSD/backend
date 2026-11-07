'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('aeronaves', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      codigo: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('aeronaves');
  },
};
