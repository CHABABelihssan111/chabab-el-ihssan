Chabab El Ihssan - optimisation de chargement du Hero

Fichier a remplacer:
  src/components/Hero.jsx

Modification:
- Seule la premiere image du Hero est chargee immediatement (eager) et avec priorite haute.
- Les autres images du diaporama passent en lazy loading et priorite basse.
- Cela evite de demander au navigateur de telecharger immediatement les diapositives suivantes.

Aucun changement aux textes, polices, couleurs, dimensions, classes CSS, animations,
transitions, ordre des diapositives ou duree du diaporama.

Validation:
- Comparaison du diff effectuee: seules les proprietes fetchPriority/loading ont change.
- Build non valide: npm ci n'a pas termine dans l'environnement de preparation.

Installation:
1. Remplacer src/components/Hero.jsx par ce fichier.
2. Dans le projet: npm ci
3. Puis: npm run build
4. Tester sur mobile et relancer PageSpeed Insights.
