/**
 * Per-song progress persisted in localStorage:
 * phrase levels (dynamic difficulty), mastery, high scores, play counts,
 * plus user-imported songs.
 */

const KEY = 'vaw.songplay.progress.v1';
const SONGS_KEY = 'vaw.songplay.usersongs.v1';
const SETTINGS_KEY = 'vaw.songplay.settings.v1';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked — progress just won't persist
  }
}

let progress = load(KEY, {});

export function getProgress(songId) {
  return progress[songId] || {
    plays: 0,
    lastPlayed: 0,
    phraseLevels: {},   // phraseIndex → level
    phraseMastered: {}, // phraseIndex → true when played ≥ 90% at max level
    mastery: 0,         // 0–110
    bestScore: {},      // difficulty → score
    bestAccuracy: 0,
    bestStreak: 0,
    medal: {},          // difficulty → 'bronze' | 'silver' | 'gold' | 'platinum'
  };
}

export function saveProgress(songId, data) {
  progress[songId] = data;
  save(KEY, progress);
}

export function allProgress() {
  return progress;
}

export function resetProgress(songId) {
  delete progress[songId];
  save(KEY, progress);
}

export function getUserSongs() {
  return load(SONGS_KEY, []);
}

export function saveUserSongs(list) {
  save(SONGS_KEY, list);
}

export function getSettings() {
  const settings = {
    tolerance: 35,       // cents
    latencyMs: 80,       // input/A-V offset compensation
    guideVolume: 0.35,
    clickVolume: 0.5,
    backingVolume: 0.4,
    guide: true,
    click: true,
    backing: true,
    showNoteNames: true,
    tuningCheck: true,
    masterMode: true,
    ...load(SETTINGS_KEY, {}),
  };
  // Highway elements are always on (no longer user-toggleable); ignore any
  // value saved by an earlier version.
  settings.guide = true;
  settings.click = true;
  settings.backing = true;
  settings.showNoteNames = true;
  return settings;
}

export function saveSettings(s) {
  save(SETTINGS_KEY, s);
}
