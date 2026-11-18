// -----------------------------------------------------------------------------
// Lecture de l'API gratuite de jourtempo.fr (sans clé ni compte).
//
// Trois fichiers JSON : tempo.json, ejp.json et pp.json. Chacun porte une date
// `perime_apres` : passé cette date, la donnée n'est plus vraie et l'intégration
// affiche « inconnu » au lieu d'une ancienne valeur. En cas de panne, la
// dernière réponse valide est gardée en mémoire, puis périme d'elle-même.
// -----------------------------------------------------------------------------

import { createLogger } from '@gladysassistant/integration-sdk';

const logger = createLogger({ name: 'jourtempo-api' });

export const API_URL = 'https://jourtempo.fr/api/v1/';
export const FICHIERS = ['tempo', 'ejp', 'pp'];

// Sans User-Agent explicite, le pare-feu du site refuse les clients génériques.
const USER_AGENT = 'gladys-jourtempo/1.0';
const DELAI_MS = 20000;
// Une lecture sert aux trois appareils interrogés à la même minute.
const CACHE_MS = 60000;

const derniers = new Map(); // fichier -> { donnees, lu_le }

function estValide(donnees) {
  return (
    donnees !== null &&
    typeof donnees === 'object' &&
    donnees.api === 'v1' &&
    typeof donnees.aujourdhui === 'object' &&
    typeof donnees.demain === 'object'
  );
}

/**
 * Vrai si le fichier manque ou si sa date `perime_apres` est dépassée.
 * @param {object | null | undefined} donnees
 * @param {Date} [maintenant]
 */
export function estPerime(donnees, maintenant = new Date()) {
  if (!donnees?.perime_apres) {
    return true;
  }
  const limite = new Date(donnees.perime_apres);
  return Number.isNaN(limite.getTime()) || maintenant > limite;
}

/**
 * Lit un fichier de l'API. Renvoie la dernière réponse valide (éventuellement
 * gardée en mémoire après une panne), ou null si aucune n'a jamais été lue.
 * @param {'tempo' | 'ejp' | 'pp'} fichier
 * @param {{ fetch?: typeof fetch, maintenant?: number }} [options]
 */
export async function lireFichier(fichier, { fetch: lire = fetch, maintenant = Date.now() } = {}) {
  const enMemoire = derniers.get(fichier);
  if (enMemoire && maintenant - enMemoire.lu_le < CACHE_MS) {
    return enMemoire.donnees;
  }
  try {
    const reponse = await lire(`${API_URL}${fichier}.json`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(DELAI_MS),
    });
    if (!reponse.ok) {
      throw new Error(`HTTP ${reponse.status}`);
    }
    const donnees = await reponse.json();
    if (!estValide(donnees)) {
      throw new Error('réponse inattendue');
    }
    derniers.set(fichier, { donnees, lu_le: maintenant });
    return donnees;
  } catch (err) {
    logger.warn(`Lecture de ${fichier}.json impossible : ${err.message}`);
    return enMemoire?.donnees ?? null;
  }
}

/** Vide la mémoire (tests). */
export function oublierLectures() {
  derniers.clear();
}
