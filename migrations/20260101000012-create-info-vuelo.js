'use strict';

// Información de vuelo: carpetas y archivos (explorador) y los dos enlaces de los cuadros inferiores.
const CARPETAS = [
  ['EMERGENCIAS FOKKER F-50', 'plane-slash'],
  ['PROCEDIMIENTOS DE EMERGENCIA B-200', 'triangle-exclamation'],
  ['AIP 2026', 'map'],
  ['CARTA SUPERIOR E INFERIOR', 'map-location-dot'],
  ['RUTAS DE ESCAPE B-200 / F-50', 'person-running'],
  ['JEPPESEN 30-01-2026', 'book'],
  ["POV'S (Procedimientos Operativos)", 'clipboard-list'],
  ['TABLA DE CAMPOS DE ALTURA', 'table-cells'],
  ['DESCENSOS VISUALES GPS', 'satellite-dish'],
  ['MANUALES B-200', 'book-open'],
  ['ANEXOS OACI', 'globe'],
  ['BREAFING 2025', 'microphone'],
  ['DIRECTIVAS VUELO VAL', 'scroll'],
  ['MANUAL AERONAVE B200', 'plane'],
];

const ENLACES = [
  {
    clave: 'meteorologia',
    titulo: 'METEOROLOGÍA',
    descripcion: 'METAR y TAF oficial de SENAMHI.',
    url: 'https://www.senamhi.gob.pe/',
  },
  {
    clave: 'aip_notams',
    titulo: 'AIP / NOTAMs',
    descripcion: 'Sistema de respaldo CORPAC.',
    url: 'https://www.corpac.gob.pe/',
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const ahora = new Date();

    await queryInterface.createTable('carpetas_info', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: Sequelize.STRING(120), allowNull: false },
      icono: { type: Sequelize.STRING(60), allowNull: false, defaultValue: 'folder' },
      padre_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'carpetas_info', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('archivos_info', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: Sequelize.STRING(255), allowNull: false },
      nombre_original: { type: Sequelize.STRING(255), allowNull: false },
      ruta: { type: Sequelize.STRING(255), allowNull: false },
      mime: { type: Sequelize.STRING(120), allowNull: false },
      tamano: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      carpeta_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'carpetas_info', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('enlaces_info', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      clave: { type: Sequelize.STRING(40), allowNull: false, unique: true },
      titulo: { type: Sequelize.STRING(80), allowNull: false },
      descripcion: { type: Sequelize.STRING(160), allowNull: false },
      url: { type: Sequelize.STRING(500), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.bulkInsert(
      'carpetas_info',
      CARPETAS.map(([nombre, icono]) => ({ nombre, icono, padre_id: null, created_at: ahora, updated_at: ahora }))
    );

    await queryInterface.bulkInsert(
      'enlaces_info',
      ENLACES.map((e) => ({ ...e, created_at: ahora, updated_at: ahora }))
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('archivos_info');
    await queryInterface.dropTable('carpetas_info');
    await queryInterface.dropTable('enlaces_info');
  },
};
