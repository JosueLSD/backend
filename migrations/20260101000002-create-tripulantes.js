'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tripulantes', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      grado: { type: Sequelize.STRING(30), allowNull: true },
      nombre: { type: Sequelize.STRING(120), allowNull: false },
      puesto: {
        type: Sequelize.ENUM(
          'Pilotos',
          'Copilotos',
          'Mecanicos',
          'Coordinador Tactico',
          'Sensorista',
          'Cargomaster',
          'Artillero',
          'Otros'
        ),
        allowNull: false,
      },
      clasificacion: { type: Sequelize.STRING(60), allowNull: true },
      cip: { type: Sequelize.STRING(20), allowNull: true },
      celular: { type: Sequelize.STRING(20), allowNull: true },
      horas: { type: Sequelize.STRING(20), allowNull: true },
      funcion: { type: Sequelize.STRING(60), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tripulantes');
  },
};
