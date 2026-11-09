import { sql } from './db.js';

export function send(res, status, body) { return res.status(status).json(body); }
export function allowed(req, res, method) {
  if (req.method === method) return true;
  res.setHeader('Allow', method);
  send(res, 405, { error: 'Method not allowed' });
  return false;
}
export function write(req, res) {
  const secret = process.env.GS_API_KEY;
  if (!secret) { send(res, 503, { error: 'GS_API_KEY is not configured' }); return false; }
  if (req.headers['x-api-key'] !== secret) { send(res, 401, { error: 'Unauthorized' }); return false; }
  return true;
}
export function validate(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw Object.assign(new Error('Invalid JSON body'), { status: 400 });
  const keys = Object.keys(body);
  const permit = ['title','description','severity','status','source'];
  if (!keys.length || keys.some(k => !permit.includes(k))) throw Object.assign(new Error('Invalid fields'), { status: 400 });
  if (!partial && (!body.title || !body.description)) throw Object.assign(new Error('Title and description required'), { status: 400 });
  const values = {};
  for (const key of keys) {
    if (typeof body[key] !== 'string') throw Object.assign(new Error('Field must be string: ' + key), { status: 400 });
    const value = body[key].trim();
    const limit = { title: [3,160], description:[3,3000], severity:[1,10], status:[1,20], source:[1,120] }[key];
    if (value.length < limit[0] || value.length > limit[1]) throw Object.assign(new Error('Invalid length: ' + key), { status: 400 });
    if (key === 'severity' && !['low','medium','high','critical'].includes(value)) throw Object.assign(new Error('Invalid severity'), { status: 400 });
    if (key === 'status' && !['open','investigating','resolved'].includes(value)) throw Object.assign(new Error('Invalid status'), { status: 400 });
    values[key] = value;
  }
  return values;
}
export function id(value) {
  const s = String(value ?? '');
  if (!/^[1-9]\d*$/.test(s)) return null;
  const n = Number(s);
  return Number.isSafeInteger(n) ? n : null;
}
export async function audit(incidentId, action, details) {
  try { await sql('INSERT INTO audit_logs (incident_id,action,details) VALUES (?,?,?)', [incidentId,action,JSON.stringify(details)]); }
  catch (e) { console.error('Audit write failed', e.message); throw e; }
}
export function fail(res, error) {
  console.error('API error', error?.message);
  const status = [400,401,403,404,409,422].includes(error?.status) ? error.status : 500;
  return send(res,status,{error: status === 500 ? 'Internal server error' : error.message});
}
