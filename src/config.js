// -----------------------------------------------------------------------------
// Configuration de l'intégration, remplie par l'utilisateur dans Gladys à partir
// du `config_schema` de `gladys-assistant-integration.json`.
// -----------------------------------------------------------------------------

// Valeurs par défaut : elles DOIVENT rester identiques aux `default` du manifeste.
export const DEFAULT_CONFIG = {
  suivre_ejp: true,
  suivre_pp: true,
  suivre_tempo: false,
};

// Intervalle entre deux lectures de l'API, en secondes. Gladys interroge au plus
// une fois par minute : les lectures intermédiaires sont sautées.
export const INTERVALLE_LECTURE = 900;

/**
 * Fusionne la configuration reçue avec les valeurs par défaut.
 * @param {Record<string, unknown>} raw
 */
export function normalizeConfig(raw = {}) {
  const booleen = (cle) =>
    raw[cle] === undefined || raw[cle] === null
      ? DEFAULT_CONFIG[cle]
      : raw[cle] === true || raw[cle] === 'true';
  return {
    suivre_ejp: booleen('suivre_ejp'),
    suivre_pp: booleen('suivre_pp'),
    suivre_tempo: booleen('suivre_tempo'),
  };
}
