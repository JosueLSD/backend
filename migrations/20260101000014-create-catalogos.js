'use strict';

// Tablas maestras del plan de vuelo: reglas de vuelo, tipo de aeronave y categoría de estela turbulenta.
const CATALOGOS = [
  ['reglas_vuelo', 'I', 'Todo el vuelo con IFR', 1],
  ['reglas_vuelo', 'V', 'Todo el vuelo con VFR', 2],
  ['reglas_vuelo', 'Y', 'El vuelo inicia con IFR, seguido de cambios posteriores en las reglas de vuelo', 3],
  ['reglas_vuelo', 'Z', 'El vuelo inicia con VFR, seguido de cambios posteriores en las reglas de vuelo', 4],
  ['tipo_aeronave', 'F50', 'FOKKER 50', 1],
  ['tipo_aeronave', 'BE20', 'BEECHCRAFT SUPER KING AIR B200', 2],
  ['estela', 'M', 'Media (MEDIUM)', 1],
  ['estela', 'L', 'Ligera (LIGHT)', 2],
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const ahora = new Date();

    await queryInterface.createTable('catalogos', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      tipo: { type: Sequelize.STRING(40), allowNull: false },
      codigo: { type: Sequelize.STRING(20), allowNull: false },
      descripcion: { type: Sequelize.STRING(255), allowNull: false },
      orden: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addConstraint('catalogos', {
      fields: ['tipo', 'codigo'],
      type: 'unique',
      name: 'uq_catalogos_tipo_codigo',
    });

    await queryInterface.bulkInsert(
      'catalogos',
      CATALOGOS.map(([tipo, codigo, descripcion, orden]) => ({
        tipo, codigo, descripcion, orden, created_at: ahora, updated_at: ahora,
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('catalogos');
  },
};
