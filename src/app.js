const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/error');

const app = express();

const origenes = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true;
app.use(cors({ origin: origenes }));
// Límite amplio: el HTML de una hoja con logos puede pesar varios MB (la generación de PDF lo usa).
app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
