'use strict';

// Documentos de la imagen satelital de cada vuelo (paso 5 del despacho). Viven en S3.
// "visible" controla lo que se muestra en el visor; "nuevo" marca los subidos desde la última actualización.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('imagenes_satelitales', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      vuelo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'vuelos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      nombre: { type: Sequelize.STRING(255), allowNull: false },
      ruta: { type: Sequelize.STRING(255), allowNull: false },
      mime: { type: Sequelize.STRING(120), allowNull: false },
      tamano: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      visible: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      nuevo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('imagenes_satelitales', ['vuelo_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('imagenes_satelitales');
  },
};
