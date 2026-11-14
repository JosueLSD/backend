require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;
// 0.0.0.0 para aceptar conexiones desde fuera del proceso (por ejemplo, desde un contenedor).
const HOST = process.env.HOST || '0.0.0.0';

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

  app.listen(PORT, HOST, () => console.log(`API escuchando en http://${HOST}:${PORT}/api`));
})();
