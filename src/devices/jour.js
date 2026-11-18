// -----------------------------------------------------------------------------
// Fabrique commune des trois appareils (EJP, jours PP, Tempo).
//
// Chaque appareil expose :
//   - des capteurs binaires (0/1), faits pour déclencher les scènes Gladys
//     (« si EJP demain passe à 1, alors… ») ;
//   - des textes lisibles (« Jour EJP », « Pas encore publié »…) pour le tableau
//     de bord ;
//   - des compteurs de jours restants dans la saison.
// Donnée périmée ou introuvable : binaires à 0, textes à « Inconnu ».
// -----------------------------------------------------------------------------

import {
  createLogger,
  DEVICE_FEATURE_CATEGORIES,
  DEVICE_FEATURE_TYPES,
  DEVICE_POLL_FREQUENCIES,
} from '@gladysassistant/integration-sdk';
import { estPerime, lireFichier } from '../api.js';

export const INCONNU = 'Inconnu';

/** Capteur binaire en lecture seule. */
export function binaire(cle, nom) {
  return {
    cle,
    nom,
    category: DEVICE_FEATURE_CATEGORIES.ENERGY_SENSOR,
    type: DEVICE_FEATURE_TYPES.ENERGY_SENSOR.BINARY,
    min: 0,
    max: 1,
    keep_history: true,
  };
}

/** Texte en lecture seule. */
export function texte(cle, nom) {
  return {
    cle,
    nom,
    category: DEVICE_FEATURE_CATEGORIES.TEXT,
    type: DEVICE_FEATURE_TYPES.TEXT.TEXT,
    min: 0,
    max: 0,
    keep_history: false,
  };
}

/** Compteur de jours, en lecture seule. */
export function compteur(cle, nom, max) {
  return {
    cle,
    nom,
    category: DEVICE_FEATURE_CATEGORIES.COUNTER_SENSOR,
    type: DEVICE_FEATURE_TYPES.SENSOR.INTEGER,
    min: 0,
    max,
    keep_history: true,
  };
}

/**
 * Libellé d'un jour, lu dans l'API (`libelle`), ou « Inconnu ».
 * @param {object} donnees
 * @param {'aujourdhui' | 'demain'} jour
 */
export function libelle(donnees, jour) {
  return donnees?.[jour]?.libelle || INCONNU;
}

export function code(donnees, jour) {
  return donnees?.[jour]?.code ?? 'inconnu';
}

/**
 * Crée un appareil.
 * @param {object} def
 * @param {string} def.type           identifiant stable de l'appareil (jamais changé)
 * @param {'tempo' | 'ejp' | 'pp'} def.fichier
 * @param {string} def.nom
 * @param {string} def.option         clé de configuration qui l'active
 * @param {object[]} def.capteurs     binaire() / texte() / compteur()
 * @param {(donnees: object) => Record<string, number | string>} def.valeurs
 *        valeurs de chaque capteur pour une donnée valide
 * @param {Record<string, number | string>} def.inconnues
 *        valeurs publiées quand la donnée est périmée (les compteurs gardent la leur)
 */
export function creerAppareil(def) {
  const logger = createLogger({ name: def.type });
  const ids = (gladys) => gladys.externalIds(def.type, 'jourtempo');

  return {
    key: def.type,
    option: def.option,
    fichier: def.fichier,

    deviceExternalId(gladys) {
      return ids(gladys).device;
    },

    buildDevice(gladys) {
      const id = ids(gladys);
      return {
        name: def.nom,
        external_id: id.device,
        should_poll: true,
        poll_frequency: DEVICE_POLL_FREQUENCIES.EVERY_MINUTES,
        features: def.capteurs.map((c) => ({
          name: c.nom,
          external_id: id.feature(c.cle),
          category: c.category,
          type: c.type,
          min: c.min,
          max: c.max,
          read_only: true,
          has_feedback: false,
          keep_history: c.keep_history,
        })),
      };
    },

    /** États à publier pour une réponse de l'API (ou null). */
    etats(gladys, donnees, maintenant = new Date()) {
      const id = ids(gladys);
      const valeurs = estPerime(donnees, maintenant) ? def.inconnues : def.valeurs(donnees);
      return def.capteurs
        .filter((c) => valeurs[c.cle] !== undefined && valeurs[c.cle] !== null)
        .map((c) =>
          c.type === DEVICE_FEATURE_TYPES.TEXT.TEXT
            ? { device_feature_external_id: id.feature(c.cle), text: String(valeurs[c.cle]) }
            : { device_feature_external_id: id.feature(c.cle), state: Number(valeurs[c.cle]) },
        );
    },

    async onPoll(gladys, _config, options = {}) {
      const donnees = await lireFichier(def.fichier, options);
      const etats = this.etats(gladys, donnees);
      logger.debug(`${etats.length} états à publier`);
      // N'envoie que ce qui a changé ; renvoie quand même chaque valeur toutes
      // les 6 h pour qu'elle reste récente dans Gladys.
      await gladys.publishChangedStates(etats, { heartbeat: 6 * 3600 * 1000 });
    },
  };
}
