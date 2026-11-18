import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { estPerime, lireFichier, oublierLectures } from '../src/api.js';

const BON = { api: 'v1', perime_apres: '2026-11-19T12:00:00+01:00', aujourdhui: {}, demain: {} };
const repond =
  (corps, ok = true) =>
  async () => ({ ok, status: ok ? 200 : 503, json: async () => corps });
const panne = async () => {
  throw new Error('réseau coupé');
};

beforeEach(() => oublierLectures());

test('perime_apres : avant, après, absent', () => {
  assert.equal(estPerime(BON, new Date('2026-11-19T11:59:00+01:00')), false);
  assert.equal(estPerime(BON, new Date('2026-11-19T12:01:00+01:00')), true);
  assert.equal(estPerime({ api: 'v1' }), true);
  assert.equal(estPerime(null), true);
});

test('une panne rend la dernière réponse valide', async () => {
  assert.deepEqual(await lireFichier('ejp', { fetch: repond(BON), maintenant: 0 }), BON);
  assert.deepEqual(await lireFichier('ejp', { fetch: panne, maintenant: 120000 }), BON);
});

test('sans réponse précédente, une panne rend null', async () => {
  assert.equal(await lireFichier('pp', { fetch: panne, maintenant: 0 }), null);
  assert.equal(await lireFichier('pp', { fetch: repond(BON, false), maintenant: 0 }), null);
});

test('une réponse non conforme est rejetée', async () => {
  assert.equal(await lireFichier('tempo', { fetch: repond({ api: 'v2' }), maintenant: 0 }), null);
  assert.equal(await lireFichier('tempo', { fetch: repond('<html>'), maintenant: 0 }), null);
});
