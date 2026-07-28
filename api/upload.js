export const config = {
  api: {
    bodyParser: false,
  },
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'order-inspiration';

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function parseMultipart(buffer, contentType) {
  const boundaryMatch = contentType.match(/boundary=(?:(?:"([^"]+)")|([^;]+))/i);
  if (!boundaryMatch) throw new Error('Missing multipart boundary');
  const boundary = Buffer.from(`--${boundaryMatch[1] || boundaryMatch[2]}`);
  const parts = [];
  let start = buffer.indexOf(boundary);
  while (start !== -1) {
    start += boundary.length;
    if (buffer[start] === 45 && buffer[start + 1] === 45) break;
    if (buffer[start] === 13 && buffer[start + 1] === 10) start += 2;
    const headerEnd = buffer.indexOf(Buffer.from('\r\n\r\n'), start);
    if (headerEnd === -1) break;
    const headerText = buffer.slice(start, headerEnd).toString('utf8');
    let dataStart = headerEnd + 4;
    let next = buffer.indexOf(boundary, dataStart);
    if (next === -1) break;
    let dataEnd = next;
    if (buffer[dataEnd - 2] === 13 && buffer[dataEnd - 1] === 10) dataEnd -= 2;
    const disposition = headerText.match(/content-disposition:[^\n]*name="([^"]+)"(?:;\s*filename="([^"]*)")?/i);
    const type = headerText.match(/content-type:\s*([^\r\n]+)/i);
    if (disposition?.[2]) {
      parts.push({
        field: disposition[1],
        filename: disposition[2],
        contentType: type?.[1]?.trim() || 'application/octet-stream',
        data: buffer.slice(dataStart, dataEnd),
      });
    }
    start = next;
  }
  return parts;
}

function safeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90) || 'upload.jpg';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(res, 501, { error: 'Supabase storage is not configured yet.' });
  }

  try {
    const contentType = req.headers['content-type'] || '';
    const body = await readBody(req);
    const files = parseMultipart(body, contentType).filter(p => p.field === 'photos').slice(0, 3);
    if (!files.length) return json(res, 400, { error: 'No photos uploaded.' });

    const links = [];
    const base = SUPABASE_URL.replace(/\/$/, '');
    const stamp = Date.now();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.data.length > 8 * 1024 * 1024) return json(res, 413, { error: `${file.filename} is over 8MB.` });
      const path = `orders/${stamp}-${i + 1}-${safeName(file.filename)}`;
      const upload = await fetch(`${base}/storage/v1/object/${SUPABASE_BUCKET}/${path}`, {
        method: 'PUT',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'content-type': file.contentType,
          'x-upsert': 'false',
        },
        body: file.data,
      });
      if (!upload.ok) {
        const detail = await upload.text().catch(() => '');
        return json(res, 502, { error: `Supabase upload failed for ${file.filename}.`, detail });
      }
      links.push(`${base}/storage/v1/object/public/${SUPABASE_BUCKET}/${path}`);
    }
    return json(res, 200, { links });
  } catch (err) {
    return json(res, 500, { error: err.message || 'Upload failed' });
  }
}
