import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CONFIG, normalizeConfig } from '../src/config.js';

test('valeurs par défaut : EJP et PP, sans Tempo', () => {
  assert.deepEqual(normalizeConfig(), DEFAULT_CONFIG);
  assert.deepEqual(normalizeConfig(), { suivre_ejp: true, suivre_pp: true, suivre_tempo: false });
});

test('les cases arrivent en booléen ou en texte', () => {
  assert.deepEqual(
    normalizeConfig({ suivre_ejp: false, suivre_pp: 'false', suivre_tempo: 'true' }),
    { suivre_ejp: false, suivre_pp: false, suivre_tempo: true },
  );
});
