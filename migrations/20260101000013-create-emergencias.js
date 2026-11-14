'use strict';

// Tabla maestra de emergencias para la orden de vuelo (EMERGENCIA DEL DÍA).
const EMERGENCIAS = [
  'BOTH ENGINES FLAMEOUT',
  'ENGINE FIRE / SEVERE DAMAGE',
  'ENGINE FAILURE',
  'ENGINE FAILURE DURING TAKE-OFF OR GO-AROUND',
  'INADVERTENT AUTO FEATHER',
  'SINGLE-ENGINE PROCEDURE',
  'ENGINE ITT HIGH',
  'ENGINE OIL PRESSURE LOW',
  'APU FIRE',
  'LOSS OF AC SUPPLY',
  'BATTERY OVERHEAT',
  'ELECTRICAL SMOKE',
  'AIR CONDITIONING SMOKE',
  'CABIN SMOKE / FIRE',
  'SMOKE TOILET',
  'SMOKE FORWARD / AFT CARGO',
  'SMOKE REMOVAL',
  'NOSE GEAR UP OR UNSAFE',
  'ONE MAIN GEAR UP OR UNSAFE',
  'BOTH MAIN GEARS / ALL GEARS UP OR UNSAFE',
  'FORCED LANDING',
  'DITCHING',
  'TAKE-OFF CONFIGURATION',
  'EXCESSIVE CABIN ALTITUDE',
  'EMERGENCY DESCENT',
  'EVACUATION / ON GROUND EMERGENCY',
  'AFCS FAILURE',
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const ahora = new Date();

    await queryInterface.createTable('emergencias', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      numero: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, unique: true },
      nombre: { type: Sequelize.STRING(120), allowNull: false, unique: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.bulkInsert(
      'emergencias',
      EMERGENCIAS.map((nombre, i) => ({ numero: i + 1, nombre, created_at: ahora, updated_at: ahora }))
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('emergencias');
  },
};
