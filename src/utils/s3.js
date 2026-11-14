const { S3Client, PutObjectCommand, DeleteObjectsCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Bucket de S3 para los archivos de la información de vuelo.
// Variables: S3_BUCKET y AWS_REGION. Las credenciales salen de AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY.
const BUCKET = process.env.S3_BUCKET;
const CARPETA = 'info-vuelo/';
const VIGENCIA_URL_SEGUNDOS = 300;

const cliente = new S3Client({ region: process.env.AWS_REGION });

function comprobarBucket() {
  if (!BUCKET) throw new Error('Falta S3_BUCKET en el archivo .env');
}

// Sube un archivo a S3 y devuelve su clave (la ruta dentro del bucket).
async function subirObjeto(clave, cuerpo, contentType) {
  comprobarBucket();
  await cliente.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: CARPETA + clave,
    Body: cuerpo,
    ContentType: contentType,
  }));
  return CARPETA + clave;
}

// Borra varias claves. S3 acepta hasta 1000 por llamada.
async function borrarObjetos(claves) {
  if (!claves.length) return;
  comprobarBucket();
  for (let i = 0; i < claves.length; i += 1000) {
    await cliente.send(new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: { Objects: claves.slice(i, i + 1000).map((Key) => ({ Key })) },
    }));
  }
}

// URL temporal para ver o descargar el archivo sin exponer el bucket.
async function urlFirmada({ clave, nombre, mime, descargar }) {
  comprobarBucket();
  const disposicion = `${descargar ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(nombre)}`;
  return getSignedUrl(
    cliente,
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: clave,
      ResponseContentDisposition: disposicion,
      ResponseContentType: mime,
    }),
    { expiresIn: VIGENCIA_URL_SEGUNDOS }
  );
}

module.exports = { subirObjeto, borrarObjetos, urlFirmada };
