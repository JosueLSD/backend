'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      usuario: { type: Sequelize.STRING(60), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(100), allowNull: false },
      nombre: { type: Sequelize.STRING(120), allowNull: false },
      rol: {
        type: Sequelize.ENUM('Administrador', 'Piloto', 'Despachador', 'Visualizador'),
        allowNull: false,
      },
      cip: { type: Sequelize.STRING(20), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('usuarios');
  },
};
