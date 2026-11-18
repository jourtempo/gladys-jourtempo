import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DEVICE_POLL_FREQUENCIES } from '@gladysassistant/integration-sdk';
import { createFakeGladys } from '@gladysassistant/integration-sdk/testing';
import {
  DEVICE_BLUEPRINTS,
  buildDiscoveredDevices,
  createPoller,
  findBlueprintByDevice,
} from '../src/devices/index.js';
import { ejp } from '../src/devices/ejp.js';
import { pp } from '../src/devices/pp.js';
import { tempo } from '../src/devices/tempo.js';
import { normalizeConfig } from '../src/config.js';
import { oublierLectures } from '../src/api.js';

const tout = normalizeConfig({ suivre_ejp: true, suivre_pp: true, suivre_tempo: true });
const AVANT = new Date('2026-11-18T14:00:00+01:00');
const APRES = new Date('2026-11-19T12:30:00+01:00');
const PERIME = '2026-11-19T12:00:00+01:00';

const EJP = {
  api: 'v1',
  perime_apres: PERIME,
  aujourdhui: { date: '2026-11-18', code: 'normal', libelle: 'Jour normal' },
  demain: { date: '2026-11-19', code: 'ejp', libelle: 'Jour EJP' },
  saison: { restants: 19 },
};
const PP = {
  api: 'v1',
  perime_apres: PERIME,
  aujourdhui: { date: '2026-11-18', code: 'non-pp', libelle: 'Pas de jour PP' },
  demain: { date: '2026-11-19', code: 'attente', libelle: 'Pas encore publié' },
  saison: { restants: 22 },
};
const TEMPO = {
  api: 'v1',
  perime_apres: PERIME,
  aujourdhui: { date: '2026-11-18', code: 'blanc', libelle: 'Blanc' },
  demain: { date: '2026-11-19', code: 'rouge', libelle: 'Rouge' },
  saison: {
    compteurs: { bleu: { restants: 220 }, blanc: { restants: 38 }, rouge: { restants: 19 } },
  },
};

// Valeurs publiées, par clé de capteur.
function parCle(gladys, bp, etats) {
  const prefixe = `${gladys.externalIds(bp.key, 'jourtempo').device}:`;
  return Object.fromEntries(
    etats.map((e) => [e.device_feature_external_id.slice(prefixe.length), e.text ?? e.state]),
  );
}

beforeEach(() => oublierLectures());

test('Gladys accepte les trois appareils et toutes leurs colonnes', async () => {
  const gladys = createFakeGladys();
  const devices = buildDiscoveredDevices(gladys, tout);
  await gladys.publishDiscoveredDevices(devices);
  assert.equal(gladys.fake.discoveredDevices.length, 3);
  for (const device of devices) {
    assert.equal(device.poll_frequency, DEVICE_POLL_FREQUENCIES.EVERY_MINUTES);
    for (const f of device.features) {
      const ou = `${device.name} / ${f.name}`;
      assert.ok(f.name, `${ou}: name`);
      assert.ok(
        Number.isFinite(f.min) && Number.isFinite(f.max) && f.min <= f.max,
        `${ou}: min/max`,
      );
      assert.equal(f.read_only, true, `${ou}: read_only`);
      assert.equal(f.has_feedback, false, `${ou}: has_feedback`);
    }
  }
});

test('seuls les appareils cochés sont proposés (EJP et PP par défaut)', () => {
  const gladys = createFakeGladys();
  const noms = buildDiscoveredDevices(gladys, normalizeConfig()).map((d) => d.name);
  assert.deepEqual(noms, ['Jour Tempo · EJP', 'Jour Tempo · Jours PP']);
});

test('chaque appareil se retrouve par son identifiant', () => {
  const gladys = createFakeGladys();
  for (const bp of DEVICE_BLUEPRINTS) {
    assert.equal(findBlueprintByDevice(gladys, { external_id: bp.deviceExternalId(gladys) }), bp);
  }
});

test('EJP : valeurs justes', () => {
  const gladys = createFakeGladys();
  assert.deepEqual(parCle(gladys, ejp, ejp.etats(gladys, EJP, AVANT)), {
    aujourdhui: 0,
    demain: 1,
    etat_aujourdhui: 'Jour normal',
    etat_demain: 'Jour EJP',
    restants: 19,
  });
});

test('PP : demain pas encore publié', () => {
  const gladys = createFakeGladys();
  const v = parCle(gladys, pp, pp.etats(gladys, PP, AVANT));
  assert.equal(v.demain, 0);
  assert.equal(v.etat_demain, 'Pas encore publié');
  assert.equal(v.restants, 22);
});

test('Tempo : alertes et compteurs', () => {
  const gladys = createFakeGladys();
  assert.deepEqual(parCle(gladys, tempo, tempo.etats(gladys, TEMPO, AVANT)), {
    aujourdhui_rouge: 0,
    demain_rouge: 1,
    demain_blanc: 0,
    couleur_aujourdhui: 'Blanc',
    couleur_demain: 'Rouge',
    restants_bleu: 220,
    restants_blanc: 38,
    restants_rouge: 19,
  });
});

test('donnée périmée ou absente : binaires à 0, textes « Inconnu », compteurs non touchés', () => {
  const gladys = createFakeGladys();
  for (const donnees of [EJP, null]) {
    assert.deepEqual(parCle(gladys, ejp, ejp.etats(gladys, donnees, APRES)), {
      aujourdhui: 0,
      demain: 0,
      etat_aujourdhui: 'Inconnu',
      etat_demain: 'Inconnu',
    });
  }
  const t = parCle(gladys, tempo, tempo.etats(gladys, TEMPO, APRES));
  assert.equal(t.demain_rouge, 0);
  assert.equal(t.couleur_demain, 'Inconnu');
});

test('une lecture toutes les 15 minutes, avec le User-Agent attendu', async () => {
  const gladys = createFakeGladys();
  await gladys.publishDiscoveredDevices(buildDiscoveredDevices(gladys, tout));
  const appels = [];
  const fetch = async (url, init) => {
    appels.push({ url, ua: init.headers['User-Agent'] });
    return { ok: true, json: async () => EJP };
  };
  const poll = createPoller();
  const device = { external_id: ejp.deviceExternalId(gladys) };
  assert.equal(await poll(gladys, device, tout, { fetch }), true);
  assert.equal(await poll(gladys, device, tout, { fetch }), false, 'deuxième lecture sautée');
  assert.equal(appels.length, 1);
  assert.equal(appels[0].url, 'https://jourtempo.fr/api/v1/ejp.json');
  assert.match(appels[0].ua, /^gladys-jourtempo\//);
});
