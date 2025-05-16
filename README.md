# Assistant Scrabble

Une application web simple permettant de trouver tous les mots possibles à partir de lettres disponibles pour le jeu de Scrabble, avec prise en charge des dictionnaires français et anglais.

## Fichiers à publier

### Fichiers requis (minimum)
Pour déployer cette application sur n'importe quel serveur web, vous aurez besoin au minimum des fichiers suivants :

- `index.html` - L'interface utilisateur HTML principale
- `scrabble.css` - Les styles pour l'apparence de l'application
- `scrabble.js` - Le script JavaScript qui contient toute la logique de l'application
- `francais.dic` - Le dictionnaire français (407 130 mots)
- `english.dic` - Le dictionnaire anglais (267 750 mots)

## Caractéristiques

- Interface utilisateur minimaliste et réactive
- Support de deux langues (français et anglais)
- Recherche automatique après 2 secondes d'inactivité
- Support des lettres jokers (utilisation du caractère "?")
- Calcul du score Scrabble pour chaque mot
- Liens vers la vérification de validité et la définition des mots

## Installation

1. Téléchargez tous les fichiers listés ci-dessus
2. Placez-les sur votre serveur web
3. Aucune configuration additionnelle n'est nécessaire

## Origine des dictionnaires

Les dictionnaires utilisés dans cette application proviennent du projet Scrabble hébergé sur SourceForge :
- Source : [https://sourceforge.net/projects/scrabble/files/Dictionaries/](https://sourceforge.net/projects/scrabble/files/Dictionaries/)

## Licence

Les dictionnaires sont soumis à la licence GNU General Public License, v3.
Le reste du code est disponible sous licence MIT.