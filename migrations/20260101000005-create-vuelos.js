'use strict';

const DOTACION = [
  'piloto_id',
  'copiloto_id',
  'mecanico_id',
  'coordinador_id',
  'sensorista_id',
  'cargomaster_id',
  'artillero_id',
  'otros_id',
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const columnas = {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      fecha: { type: Sequelize.DATEONLY, allowNull: false },
      hora_salida: { type: Sequelize.STRING(5), allowNull: false },
      hora_llegada: { type: Sequelize.STRING(5), allowNull: false },
      estado: {
        type: Sequelize.ENUM('pending', 'locked'),
        allowNull: false,
        defaultValue: 'pending',
      },
      aeronave_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'aeronaves', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      origen_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'aeropuertos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      destino_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'aeropuertos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    };

    // Cada campo de la dotación apunta a un tripulante; si se elimina, queda vacío.
    for (const campo of DOTACION) {
      columnas[campo] = {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'tripulantes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      };
    }

    await queryInterface.createTable('vuelos', columnas);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('vuelos');
  },
};
