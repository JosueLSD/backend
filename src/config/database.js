require('dotenv').config();

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
  },
};

module.exports = {
  development: base,
  test: { ...base, database: process.env.DB_NAME_TEST || `${base.database}_test` },
  production: base,
};
