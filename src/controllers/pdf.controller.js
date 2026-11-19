const { z } = require('zod');
const { renderizarPdf } = require('../utils/pdf');

// Documento a PDF. El frontend manda el HTML de la hoja y los estilos de la aplicación.
const pdfSchema = z.object({
  html: z.string().min(1).max(8000000),
  css: z.string().max(3000000),
  ancho: z.number().int().min(300).max(3000),
  nombre: z.string().trim().min(1).max(120).regex(/^[\w\-. ]+\.pdf$/i, 'Nombre de archivo inválido'),
});

async function generar(req, res) {
  const { html, css, ancho, nombre } = pdfSchema.parse(req.body);
  const pdf = await renderizarPdf({ html, css, ancho });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
  res.setHeader('Cache-Control', 'no-store');
  res.end(Buffer.from(pdf));
}

module.exports = { generar };
