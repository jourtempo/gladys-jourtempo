// -----------------------------------------------------------------------------
// Registre des appareils : EJP, jours PP et Tempo. Chacun est publié seulement
// si son option est cochée dans la configuration.
// -----------------------------------------------------------------------------

import { DEVICE_POLL_FREQUENCIES } from '@gladysassistant/integration-sdk';
import { INTERVALLE_LECTURE } from '../config.js';
import { ejp } from './ejp.js';
import { pp } from './pp.js';
import { tempo } from './tempo.js';

export const DEVICE_BLUEPRINTS = [ejp, pp, tempo];

/** Appareils activés dans la configuration. */
export function activeBlueprints(config) {
  return DEVICE_BLUEPRINTS.filter((bp) => config[bp.option]);
}

/** Liste des appareils à proposer dans l'écran Découverte de Gladys. */
export function buildDiscoveredDevices(gladys, config) {
  return activeBlueprints(config).map((bp) => bp.buildDevice(gladys, config));
}

/** Appareil propriétaire d'un device Gladys, d'après son external_id. */
export function findBlueprintByDevice(gladys, device) {
  return DEVICE_BLUEPRINTS.find((bp) => bp.deviceExternalId(gladys) === device.external_id);
}

// Gladys interroge chaque minute, à quelques millisecondes près : une lecture due
// dans la demi-minute est faite tout de suite.
const TOLERANCE_MS = DEVICE_POLL_FREQUENCIES.EVERY_MINUTES / 2;

/**
 * Répartiteur de `onPoll` : une lecture de l'API toutes les 15 minutes par
 * appareil. Renvoie true si l'appareil a été lu, false si la lecture est sautée.
 */
export function createPoller(intervalle = INTERVALLE_LECTURE) {
  const dernieres = new Map();
  return async function pollDevice(gladys, device, config, options) {
    const blueprint = findBlueprintByDevice(gladys, device);
    if (!blueprint) {
      return false;
    }
    const maintenant = Date.now();
    const derniere = dernieres.get(device.external_id);
    if (derniere !== undefined && maintenant - derniere < intervalle * 1000 - TOLERANCE_MS) {
      return false;
    }
    await blueprint.onPoll(gladys, config, options);
    dernieres.set(device.external_id, maintenant);
    return true;
  };
}
