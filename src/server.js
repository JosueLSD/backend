require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

(async () => {
  if (!process.env.JWT_SECRET) {
    console.error('Falta JWT_SECRET en el archivo .env');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
  } catch (err) {
    console.error('No se pudo conectar a MySQL:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}/api`));
})();
