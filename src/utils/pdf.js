// Genera PDF con un navegador (Chromium) en el servidor. El diseño se ve igual que en pantalla,
// sin depender de la captura en el cliente.
const puppeteer = require('puppeteer-core');

// Ruta del navegador: en Docker es Chromium del sistema (CHROME_PATH). Local puede ser Chrome.
const RUTA_NAVEGADOR = process.env.CHROME_PATH || '/usr/bin/chromium';
const TIEMPO_MAXIMO_MS = 60000;
// Ancho útil de una hoja A4 (210 mm menos márgenes de 8 mm), en px CSS (96 px por pulgada).
const ANCHO_A4_PX = 733;

let navegador = null;

async function obtenerNavegador() {
  if (!navegador || !navegador.connected) {
    navegador = await puppeteer.launch({
      executablePath: RUTA_NAVEGADOR,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
    });
  }
  return navegador;
}

// html: contenido del documento. css: hojas de estilo de la aplicación (texto).
async function renderizarPdf({ html, css, ancho }) {
  const navegadorActual = await obtenerNavegador();
  const pagina = await navegadorActual.newPage();
  try {
    // Sin JavaScript: el documento es estático. Se bloquea cualquier carga externa.
    await pagina.setJavaScriptEnabled(false);
    await pagina.setRequestInterception(true);
    pagina.on('request', (peticion) => {
      if (peticion.url().startsWith('data:') || peticion.url().startsWith('about:')) peticion.continue();
      else peticion.abort();
    });

    const documento = `<!doctype html><html><head><meta charset="utf-8">
      <style>${css}</style>
      <style>html,body{height:auto!important;overflow:visible!important;margin:0;background:#fff;}
      /* Los contenedores en bloque permiten partir la hoja entre páginas (un inline-block no se parte). */
      #raiz div{display:block!important;}
      /* La hoja de impresión de la orden de vuelo reduce la tabla con zoom 0.53; aquí no aplica. */
      .ov-sheet{zoom:1!important;}</style>
      </head><body>
        <div id="raiz" style="width:${ancho}px;padding:10px;box-sizing:border-box;background:#fff;color:#000;">${html}</div>
      </body></html>`;

    // Página del ancho exacto de la hoja (proporción A4) y contenido sin escalar: Chromium no aplasta
    // columnas al reducir. Al imprimir en A4 el visor ajusta la página al papel.
    const anchoPagina = ancho + 40;
    const altoPagina = Math.round(anchoPagina * (297 / 210));
    await pagina.setViewport({ width: anchoPagina, height: altoPagina, deviceScaleFactor: 1 });
    await pagina.setContent(documento, { waitUntil: 'load', timeout: TIEMPO_MAXIMO_MS });
    await pagina.emulateMediaType('screen');

    return await pagina.pdf({
      width: `${anchoPagina}px`,
      height: `${altoPagina}px`,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      timeout: TIEMPO_MAXIMO_MS,
    });
  } finally {
    await pagina.close().catch(() => {});
  }
}

module.exports = { renderizarPdf };
