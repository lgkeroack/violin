import { BUILTIN_SONGS } from './library/index.js';
import { parseABC } from './abc-parser.js';
import { buildChart } from './song-model.js';
import { getUserSongs, saveUserSongs } from './progress-store.js';

/**
 * Song catalog: built-in library + user songs (imported ABC / MIDI / The Session).
 * Parses lazily and caches charts per tuning.
 */

const parsedCache = new Map();
let idCounter = 0;
const chartCache = new Map();

export function allSongs() {
  return [...BUILTIN_SONGS, ...getUserSongs().map(s => ({ ...s, source: 'user' }))];
}

export function getParsed(song) {
  if (song.parsed) return song.parsed;
  let p = parsedCache.get(song.id);
  if (!p) {
    p = parseABC(song.abc);
    parsedCache.set(song.id, p);
  }
  return p;
}

export function getChart(song, tuningKey) {
  const key = `${song.id}|${tuningKey}`;
  let c = chartCache.get(key);
  if (!c) {
    c = buildChart(getParsed(song), tuningKey);
    chartCache.set(key, c);
  }
  return c;
}

/** Lightweight metadata for listing. */
export function songMeta(song, tuningKey) {
  const p = getParsed(song);
  const c = getChart(song, tuningKey);
  return {
    title: p.title,
    composer: p.composer || p.origin || '',
    key: p.key.label,
    meter: p.meter.text,
    tempo: Math.round(p.tempo),
    notes: c.notes.length,
    duration: (p.totalBeats * 60) / p.tempo,
    difficulty: c.difficulty,
    maxPosition: c.maxPosition,
    phrases: c.phrases.length,
    rhythm: p.rhythm,
  };
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

/** Add an ABC tune (or ABC parsed object for MIDI) to My Songs. Returns the new song. */
export function addUserSong({ title, abc, parsed, genre = 'My Songs', origin = '' }) {
  const list = getUserSongs();
  const id = `user-${slug(title || 'song')}-${Date.now().toString(36)}${(idCounter++).toString(36)}`;
  const song = { id, title, genre, origin };
  if (abc) song.abc = abc;
  if (parsed) song.parsed = parsed;
  list.push(song);
  saveUserSongs(list);
  return { ...song, source: 'user' };
}

export function removeUserSong(id) {
  saveUserSongs(getUserSongs().filter(s => s.id !== id));
  parsedCache.delete(id);
  for (const k of [...chartCache.keys()]) if (k.startsWith(id + '|')) chartCache.delete(k);
}
