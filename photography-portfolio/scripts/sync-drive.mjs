import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const KEY = process.env.GOOGLE_API_KEY;
const ROOT = process.env.DRIVE_FOLDER_ID;
const OUT = 'public/images';
const MANIFEST = `${OUT}/manifest.json`;
const API = 'https://www.googleapis.com/drive/v3';

if (!KEY || !ROOT) throw new Error('Faltan GOOGLE_API_KEY o DRIVE_FOLDER_ID');

async function api(path) {
  const res = await fetch(`${API}${path}${path.includes('?') ? '&' : '?'}key=${KEY}`);
  if (!res.ok) throw new Error(`Drive ${res.status}: ${await res.text()}`);
  return res;
}

async function list(q, fields) {
  const files = [];
  let pageToken;
  do {
    const params = new URLSearchParams({
      q,
      fields: `nextPageToken, files(${fields})`,
      pageSize: '200'
    });
    if (pageToken) params.set('pageToken', pageToken);
    const data = await (await api(`/files?${params}`)).json();
    files.push(...data.files);
    pageToken = data.nextPageToken;
  } while (pageToken);
  return files;
}

const titulo = (nombre) => nombre.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();

const slug = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'foto';

const carpetaSegura = (nombre) => nombre.replace(/[^\p{L}\p{N}_-]/gu, '_');

let anterior = [];
try {
  anterior = JSON.parse(await readFile(MANIFEST, 'utf8'));
} catch {}
const cache = new Map(anterior.map((f) => [f.id, f]));

const carpetas = await list(
  `'${ROOT}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
  'id,name'
);

const manifest = [];

for (const carpeta of carpetas) {
  const dir = `${OUT}/${carpetaSegura(carpeta.name)}`;
  await mkdir(dir, { recursive: true });

  const imagenes = await list(
    `'${carpeta.id}' in parents and mimeType contains 'image/' and trashed=false`,
    'id,name,modifiedTime,createdTime'
  );

  for (const img of imagenes) {
    const nombreArchivo = `${slug(titulo(img.name))}-${img.id.slice(0, 6)}.webp`;
    const ruta = `${dir}/${nombreArchivo}`;
    const url = encodeURI(`/${ruta.replace(/^public\//, '')}`);
    const previa = cache.get(img.id);

    if (previa && previa.modificada === img.modifiedTime && previa.imagen === url && existsSync(ruta)) {
      manifest.push({ ...previa, titulo: titulo(img.name), categoria: carpeta.name });
      continue;
    }

    try {
      const buf = Buffer.from(await (await api(`/files/${img.id}?alt=media`)).arrayBuffer());
      const { data, info } = await sharp(buf)
        .rotate()
        .resize({ width: 1800, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });

      await writeFile(ruta, data);

      if (previa && previa.imagen !== url) {
        await rm(`public${decodeURI(previa.imagen)}`, { force: true });
      }

      manifest.push({
        id: img.id,
        titulo: titulo(img.name),
        categoria: carpeta.name,
        imagen: url,
        ancho: info.width,
        alto: info.height,
        creada: img.createdTime,
        modificada: img.modifiedTime
      });
      console.log('Descargada:', carpeta.name, '/', img.name);
    } catch (e) {
      console.warn('Saltada', img.name, e.message);
    }
  }
}

manifest.sort((a, b) => b.creada.localeCompare(a.creada));

const vigentes = new Set(manifest.map((f) => f.id));
for (const f of anterior) {
  if (!vigentes.has(f.id)) await rm(`public${decodeURI(f.imagen)}`, { force: true });
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`Total: ${manifest.length} fotos`);