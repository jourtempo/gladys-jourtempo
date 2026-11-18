# Jour Tempo

Jour Tempo ajoute à Gladys les **jours EJP** et les **jours de pointe PP**, aujourd'hui et demain, avec les jours restants dans la saison. En option, il ajoute aussi la couleur Tempo avec des alertes « demain rouge » et « demain blanc ». Les données viennent de l'API gratuite de [jourtempo.fr](https://jourtempo.fr/api/), lue toutes les 15 minutes : pas de compte, pas de clé.

## Configuration

Cochez les données à suivre : **Jours EJP** et **Jours PP** sont activés par défaut. **Couleur Tempo** est facultative, car Gladys sait déjà afficher la couleur Tempo. Ouvrez ensuite l'onglet **Découverte** et ajoutez les appareils proposés.

## Appareils

**Jour Tempo · EJP** (calendrier publié par EDF, saison du 1er novembre au 31 mars)

- Jour EJP aujourd'hui, Jour EJP demain : 1 si c'est un jour EJP, sinon 0.
- EJP aujourd'hui, EJP demain : « Jour EJP », « Jour normal », « Pas encore vérifié », « Hors saison ».
- Jours EJP restants : sur les 22 de la saison.

**Jour Tempo · Jours PP** (signaux publiés par RTE pour le mécanisme de capacité)

- Jour PP aujourd'hui, Jour PP demain : 1 si c'est un jour PP, sinon 0.
- PP aujourd'hui, PP demain : « Jour PP », « Pas de jour PP », « Pas encore publié », « Jamais PP (week-end ou férié) »…
- Jours PP restants dans la saison.

**Jour Tempo · Tempo** (facultatif, source RTE)

- Jour rouge aujourd'hui, Jour rouge demain, Jour blanc demain : 1 ou 0.
- Couleur Tempo aujourd'hui et demain, jours bleus, blancs et rouges restants.

## Exemples de scènes

- **Prévenir la veille d'un jour EJP** : déclencheur « Jour EJP demain » passe à 1, action : envoyer un message.
- **Délester un jour EJP** : à 7 h, condition « Jour EJP aujourd'hui » égal à 1, action : baisser le chauffage.
- **Jour PP** : même principe avec « Jour PP demain » ou « Jour PP aujourd'hui ».

## En cas de panne

Chaque fichier de l'API porte une date de validité. Si jourtempo.fr ne répond plus, l'intégration garde la dernière réponse. Une fois la date de validité passée, les capteurs binaires passent à 0 et les textes à « Inconnu », plutôt que d'afficher une ancienne valeur. Une scène ne se déclenche donc jamais sur une donnée périmée.

## Sources

Jours EJP : calendrier publié par EDF. Jours PP : signaux publiés par RTE. Couleur Tempo : RTE. Les données sont relevées et diffusées par [Jour Tempo](https://jourtempo.fr/), service indépendant sans lien avec EDF ni RTE ; en cas de doute, les pages d'EDF et de RTE font foi.
