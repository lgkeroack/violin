/**
 * Live search of The Session (thesession.org) — tens of thousands of
 * traditional tunes in ABC. Data is fetched at runtime from the public
 * read-only API (CORS enabled) and is not bundled with the app.
 *
 * Contains information from The Session, made available under the
 * Open Database License (ODbL): https://opendatacommons.org/licenses/odbl/
 */

const BASE = 'https://thesession.org';

const METER_BY_TYPE = {
  reel: '4/4', jig: '6/8', 'slip jig': '9/8', hornpipe: '4/4', polka: '2/4',
  slide: '12/8', waltz: '3/4', barndance: '4/4', strathspey: '4/4',
  'three-two': '3/2', mazurka: '3/4', march: '4/4',
};

const TEMPO_BY_TYPE = {
  reel: '1/4=140', jig: '3/8=110', 'slip jig': '3/8=110', hornpipe: '1/4=120',
  polka: '1/4=140', slide: '3/8=120', waltz: '1/4=120', barndance: '1/4=130',
  strathspey: '1/4=100', 'three-two': '1/2=80', mazurka: '1/4=120', march: '1/4=110',
};

export const SESSION_TYPES = Object.keys(METER_BY_TYPE);

async function getJSON(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`The Session returned ${res.status}`);
  return res.json();
}

/**
 * Search tunes. Empty query returns popular tunes.
 * @returns {Promise<{tunes:Array<{id:number,name:string,type:string}>, page:number, pages:number, total:number}>}
 */
export async function searchSession(query, { type = '', page = 1 } = {}) {
  const params = new URLSearchParams({ format: 'json', perpage: '50', page: String(page) });
  let path = '/tunes/popular';
  if (query) {
    path = '/tunes/search';
    params.set('q', query);
  }
  if (type) params.set('type', type);
  const data = await getJSON(`${BASE}${path}?${params}`);
  return {
    tunes: (data.tunes || []).map(t => ({ id: t.id, name: t.name, type: t.type, url: t.url })),
    page: data.page || 1,
    pages: data.pages || 1,
    total: data.total || 0,
  };
}

/** Convert The Session's "Gmajor" / "Edorian" style key into an ABC K: value. */
function sessionKeyToAbc(key) {
  const m = (key || '').match(/^([A-G][b#]?)(major|minor|dorian|mixolydian|lydian|phrygian|locrian)?/i);
  if (!m) return 'C';
  const mode = (m[2] || 'major').toLowerCase();
  const suffix = { major: '', minor: 'm', dorian: 'dor', mixolydian: 'mix', lydian: 'lyd', phrygian: 'phr', locrian: 'loc' }[mode];
  return m[1] + suffix;
}

/**
 * Fetch a tune and return a list of full ABC strings (one per setting).
 */
export async function fetchSessionTune(id) {
  const data = await getJSON(`${BASE}/tunes/${encodeURIComponent(id)}?format=json`);
  const type = (data.type || '').toLowerCase();
  const meter = METER_BY_TYPE[type] || '4/4';
  const tempo = TEMPO_BY_TYPE[type] || '1/4=110';
  const settings = (data.settings || []).map((s, i) => {
    const body = String(s.abc || '').replace(/\\r\\n|\\n/g, '\n');
    const abc = [
      `X:${i + 1}`,
      `T:${data.name}`,
      `R:${type}`,
      `M:${meter}`,
      'L:1/8',
      `Q:${tempo}`,
      `O:The Session #${data.id} (setting ${i + 1})`,
      `K:${sessionKeyToAbc(s.key)}`,
      body,
    ].join('\n');
    return { settingId: s.id, key: s.key, abc };
  });
  return {
    id: data.id,
    name: data.name,
    type,
    url: data.url || `${BASE}/tunes/${data.id}`,
    settings,
  };
}
