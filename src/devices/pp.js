// Appareil « Jour Tempo · Jours PP » : jours de pointe PP du mécanisme de
// capacité (signaux publiés par RTE), aujourd'hui et demain, et jours PP restants
// dans la saison (novembre à mars).

import { binaire, code, compteur, creerAppareil, INCONNU, libelle, texte } from './jour.js';

export const pp = creerAppareil({
  type: 'pp',
  fichier: 'pp',
  nom: 'Jour Tempo · Jours PP',
  option: 'suivre_pp',
  capteurs: [
    binaire('aujourdhui', "Jour PP aujourd'hui"),
    binaire('demain', 'Jour PP demain'),
    texte('etat_aujourdhui', "PP aujourd'hui"),
    texte('etat_demain', 'PP demain'),
    compteur('restants', 'Jours PP restants', 30),
  ],
  valeurs: (d) => ({
    aujourdhui: code(d, 'aujourdhui') === 'pp' ? 1 : 0,
    demain: code(d, 'demain') === 'pp' ? 1 : 0,
    etat_aujourdhui: libelle(d, 'aujourdhui'),
    etat_demain: libelle(d, 'demain'),
    restants: d.saison?.restants,
  }),
  inconnues: { aujourdhui: 0, demain: 0, etat_aujourdhui: INCONNU, etat_demain: INCONNU },
});
