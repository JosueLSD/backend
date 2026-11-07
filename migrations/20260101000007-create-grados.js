'use strict';

// Grados que aparecen en la plantilla DESPACHO.html (DEFAULT_DB).
const GRADOS = ['TTE 1', 'TTE 2', 'T2 MOA', 'T2 SEA', 'OM 1 ART', 'T1'];

const FK_GRADO = 'fk_tripulantes_grado';

module.exports = {
  async up(queryInterface, Sequelize) {
    const ahora = new Date();

    await queryInterface.createTable('grados', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.bulkInsert(
      'grados',
      GRADOS.map((nombre) => ({ nombre, created_at: ahora, updated_at: ahora }))
    );

    // Grados que ya estaban escritos en tripulantes y no están en la lista se agregan, para no perderlos.
    await queryInterface.sequelize.query(`
      INSERT IGNORE INTO grados (nombre, created_at, updated_at)
      SELECT DISTINCT TRIM(grado), NOW(), NOW()
      FROM tripulantes
      WHERE grado IS NOT NULL AND TRIM(grado) <> ''
    `);

    await queryInterface.addColumn('tripulantes', 'grado_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint('tripulantes', {
      fields: ['grado_id'],
      type: 'foreign key',
      name: FK_GRADO,
      references: { table: 'grados', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.sequelize.query(`
      UPDATE tripulantes t
      JOIN grados g ON g.nombre = TRIM(t.grado)
      SET t.grado_id = g.id
    `);

    await queryInterface.removeColumn('tripulantes', 'grado');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('tripulantes', 'grado', {
      type: Sequelize.STRING(30),
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE tripulantes t
      JOIN grados g ON g.id = t.grado_id
      SET t.grado = g.nombre
    `);

    await queryInterface.removeConstraint('tripulantes', FK_GRADO);
    await queryInterface.removeColumn('tripulantes', 'grado_id');
    await queryInterface.dropTable('grados');
  },
};
