'use strict';

// Funciones de la plantilla DESPACHO.html. Las que tienen puesto son fijas para ese puesto;
// Observador no tiene puesto y es libre (se usa en Otros).
const FUNCIONES = [
  { nombre: 'Piloto', puesto: 'Pilotos' },
  { nombre: 'Copiloto', puesto: 'Copilotos' },
  { nombre: 'Mecánico', puesto: 'Mecanicos' },
  { nombre: 'Coordinador', puesto: 'Coordinador Tactico' },
  { nombre: 'Sensorista', puesto: 'Sensorista' },
  { nombre: 'Carga', puesto: 'Cargomaster' },
  { nombre: 'Artillero', puesto: 'Artillero' },
  { nombre: 'Observador', puesto: null },
];

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

const FK_FUNCION = 'fk_tripulantes_funcion';

module.exports = {
  async up(queryInterface, Sequelize) {
    const ahora = new Date();

    await queryInterface.createTable('funciones', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: Sequelize.STRING(60), allowNull: false, unique: true },
      puesto: { type: Sequelize.ENUM(...PUESTOS), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.bulkInsert(
      'funciones',
      FUNCIONES.map((f) => ({ ...f, created_at: ahora, updated_at: ahora }))
    );

    // Funciones que ya estaban escritas en tripulantes y no están en la lista se agregan como libres.
    await queryInterface.sequelize.query(`
      INSERT IGNORE INTO funciones (nombre, puesto, created_at, updated_at)
      SELECT DISTINCT TRIM(funcion), NULL, NOW(), NOW()
      FROM tripulantes
      WHERE funcion IS NOT NULL AND TRIM(funcion) <> ''
    `);

    await queryInterface.addColumn('tripulantes', 'funcion_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint('tripulantes', {
      fields: ['funcion_id'],
      type: 'foreign key',
      name: FK_FUNCION,
      references: { table: 'funciones', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.sequelize.query(`
      UPDATE tripulantes t
      JOIN funciones f ON f.nombre = TRIM(t.funcion)
      SET t.funcion_id = f.id
    `);

    // Un tripulante en un puesto con función fija siempre tiene esa función.
    await queryInterface.sequelize.query(`
      UPDATE tripulantes t
      JOIN funciones f ON f.puesto = t.puesto
      SET t.funcion_id = f.id
    `);

    await queryInterface.removeColumn('tripulantes', 'funcion');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('tripulantes', 'funcion', {
      type: Sequelize.STRING(60),
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE tripulantes t
      JOIN funciones f ON f.id = t.funcion_id
      SET t.funcion = f.nombre
    `);

    await queryInterface.removeConstraint('tripulantes', FK_FUNCION);
    await queryInterface.removeColumn('tripulantes', 'funcion_id');
    await queryInterface.dropTable('funciones');
  },
};
