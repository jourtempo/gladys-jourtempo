# Jour Tempo pour Gladys Assistant

Intégration externe [Gladys Assistant](https://gladysassistant.com/) : **jours EJP**, **jours de pointe PP** et, en option, **couleur Tempo**, aujourd'hui et demain, avec les jours restants de la saison. Les données viennent de l'API gratuite de [jourtempo.fr](https://jourtempo.fr/api/) : pas de compte, pas de clé.

- capteurs binaires (0/1) prêts pour les scènes : « Jour EJP demain », « Jour PP demain », « Jour rouge demain »… ;
- états lisibles pour le tableau de bord et jours restants de chaque saison ;
- lecture toutes les 15 minutes ; si la source tombe en panne longtemps, les capteurs passent à 0 / « Inconnu » plutôt que de garder une ancienne valeur.

Documentation : [docs/fr.md](docs/fr.md) (en anglais : [docs/en.md](docs/en.md)).

## Installation

Dans Gladys (4.86 ou plus récent) : **Intégrations**, catalogue communautaire, **Jour Tempo**, **Installer**. Ou ajoutez l'adresse de ce dépôt.

## Développement

```bash
npm install
npm test
npm run lint
```

Données : jours EJP publiés par EDF, signaux PP et couleur Tempo publiés par RTE, relevés et diffusés par [Jour Tempo](https://jourtempo.fr/). Service indépendant, sans lien avec EDF ni RTE.

Construit à partir du modèle officiel `GladysAssistant/integration-template-js` (Apache-2.0).
