// Appareil « Jour Tempo · Tempo » (désactivé par défaut : Gladys sait déjà lire
// la couleur Tempo) : couleur d'aujourd'hui et de demain (source RTE), alertes
// « demain rouge / blanc » et jours restants de chaque couleur.

import { binaire, code, compteur, creerAppareil, INCONNU, libelle, texte } from './jour.js';

const restants = (d, couleur) => d.saison?.compteurs?.[couleur]?.restants;

export const tempo = creerAppareil({
  type: 'tempo',
  fichier: 'tempo',
  nom: 'Jour Tempo · Tempo',
  option: 'suivre_tempo',
  capteurs: [
    binaire('aujourdhui_rouge', "Jour rouge aujourd'hui"),
    binaire('demain_rouge', 'Jour rouge demain'),
    binaire('demain_blanc', 'Jour blanc demain'),
    texte('couleur_aujourdhui', "Couleur Tempo aujourd'hui"),
    texte('couleur_demain', 'Couleur Tempo demain'),
    compteur('restants_bleu', 'Jours bleus restants', 300),
    compteur('restants_blanc', 'Jours blancs restants', 43),
    compteur('restants_rouge', 'Jours rouges restants', 22),
  ],
  valeurs: (d) => ({
    aujourdhui_rouge: code(d, 'aujourdhui') === 'rouge' ? 1 : 0,
    demain_rouge: code(d, 'demain') === 'rouge' ? 1 : 0,
    demain_blanc: code(d, 'demain') === 'blanc' ? 1 : 0,
    couleur_aujourdhui: libelle(d, 'aujourdhui'),
    couleur_demain: libelle(d, 'demain'),
    restants_bleu: restants(d, 'bleu'),
    restants_blanc: restants(d, 'blanc'),
    restants_rouge: restants(d, 'rouge'),
  }),
  inconnues: {
    aujourdhui_rouge: 0,
    demain_rouge: 0,
    demain_blanc: 0,
    couleur_aujourdhui: INCONNU,
    couleur_demain: INCONNU,
  },
});
