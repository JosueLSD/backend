const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/error');

const app = express();

const origenes = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true;
app.use(cors({ origin: origenes }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
