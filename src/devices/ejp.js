// Appareil « Jour Tempo · EJP » : jour EJP d'aujourd'hui et de demain (calendrier
// publié par EDF), jours EJP restants sur les 22 de la saison (novembre à mars).

import { binaire, code, compteur, creerAppareil, INCONNU, libelle, texte } from './jour.js';

export const ejp = creerAppareil({
  type: 'ejp',
  fichier: 'ejp',
  nom: 'Jour Tempo · EJP',
  option: 'suivre_ejp',
  capteurs: [
    binaire('aujourdhui', "Jour EJP aujourd'hui"),
    binaire('demain', 'Jour EJP demain'),
    texte('etat_aujourdhui', "EJP aujourd'hui"),
    texte('etat_demain', 'EJP demain'),
    compteur('restants', 'Jours EJP restants', 22),
  ],
  valeurs: (d) => ({
    aujourdhui: code(d, 'aujourdhui') === 'ejp' ? 1 : 0,
    demain: code(d, 'demain') === 'ejp' ? 1 : 0,
    etat_aujourdhui: libelle(d, 'aujourdhui'),
    etat_demain: libelle(d, 'demain'),
    restants: d.saison?.restants,
  }),
  inconnues: { aujourdhui: 0, demain: 0, etat_aujourdhui: INCONNU, etat_demain: INCONNU },
});
