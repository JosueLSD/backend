'use strict';

// Chat de la pestaña Notificaciones. "chat_lecturas" guarda hasta qué mensaje leyó cada usuario,
// y de ahí sale el número de mensajes no vistos del menú lateral.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mensajes_chat', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      texto: { type: Sequelize.STRING(1000), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.createTable('chat_lecturas', {
      usuario_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ultimo_leido_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('chat_lecturas');
    await queryInterface.dropTable('mensajes_chat');
  },
};
