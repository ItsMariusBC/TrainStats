# TrainStats - Liste des tâches à accomplir

## Concept de base
Application familiale simple pour partager les trajets en train en temps réel. L'admin (vous) peut créer des trajets et mettre à jour sa position. Les membres de la famille peuvent suivre ces trajets en temps réel.

## Authentification et utilisateurs
- [x] Configuration de la base de données PostgreSQL en développement
- [x] Configuration de Prisma et migrations initiales
- [x] Création du script pour ajouter/promouvoir un compte administrateur
- [x] Correction des relations dans le schéma Prisma
- [x] Simplifier le système d'invitation pour famille uniquement
- [x] Limiter les droits des utilisateurs non-admin (vue seule)

## Dashboard utilisateur
- [x] Simplifier l'interface utilisateur pour afficher clairement les trajets en cours
- [x] Créer une vue distincte admin vs membre de la famille
- [ ] Développer la vue détaillée d'un trajet avec carte et timing
- [x] Ajouter des indicateurs visuels de progression du trajet
- [ ] Optimiser l'interface pour mobile (consultation en déplacement)

## Suivi en temps réel
- [x] Ajouter champs manquants dans le schema Prisma (isPublic, trainNumber, actualTime, notes, etc.)
- [x] Tester le fonctionnement des API avec ces nouveaux champs
- [x] Améliorer le hook useJourneyUpdates avec des types TypeScript appropriés
- [x] Créer un composant réutilisable pour le suivi en temps réel des trajets
- [x] Ajouter les routes API pour mettre à jour la position et le statut d'un trajet
- [x] Interface simple pour l'admin pour mettre à jour sa position actuelle
- [x] Page de suivi en temps réel avec affichage du statut actuel
- [x] Notifications en temps réel pour les membres de la famille
- [ ] Implémenter une carte interactive montrant la progression du trajet
- [ ] Ajout d'estimation du temps d'arrivée dynamique

## Gestion des trajets
- [ ] Simplifier le formulaire de création de trajet pour l'admin
- [ ] Interface rapide de mise à jour des arrêts (marquer comme passés)
- [ ] Ajouter la possibilité d'annuler ou reporter un trajet
- [ ] Pouvoir ajouter des notes/commentaires pendant le trajet
- [x] Corriger les erreurs TypeScript dans les routes API des trajets

## Système d'invitations simplifié
- [ ] Simplifier l'interface d'envoi d'invitations pour la famille uniquement
- [ ] Implémenter l'envoi d'emails avec les liens d'invitation
- [ ] Création simple de comptes familiaux sans processus complexe
- [ ] Supprimer les statistiques et fonctionnalités avancées non nécessaires

## Administration
- [ ] Simplifier le tableau de bord administrateur pour la création et gestion de trajets
- [ ] Interface simple pour inviter des membres de la famille
- [ ] Panneau de contrôle pour mettre à jour la position du train en temps réel
- [ ] Permettre d'ajouter des notes/commentaires pendant le voyage
- [ ] Visualiser qui suit actuellement le trajet

## Déploiement et sécurité
- [x] Configurer l'environnement de développement avec Docker
- [ ] Configuration simple pour déploiement sur Vercel ou Netlify
- [ ] Sécuriser les routes d'API pour les fonctionnalités administratives
- [ ] Mettre en place une sauvegarde automatique des données
- [ ] Configuration pour une utilisation sur mobile (PWA)

## UI/UX
- [ ] Optimiser l'interface pour mobile (priorité haute - visualisation en déplacement)
- [ ] Conception visuelle simple et intuitive pour tous les membres de la famille
- [ ] Interface claire pour voir la progression d'un trajet en temps réel
- [ ] Notifications visuelles lors des mises à jour
- [ ] Carte interactive simple avec la position du train

## Fonctionnalités prioritaires à implémenter
- [x] Corriger les erreurs TypeScript dans les routes API (actualTime, isPublic, followers)
- [x] Améliorer l'intégration Socket.io pour les mises à jour en temps réel
- [x] Implémenter l'interface admin de gestion des trajets en temps réel
- [ ] Ajouter une carte interactive pour visualiser la progression du trajet
- [ ] Tester le processus complet de création et suivi d'un trajet
- [ ] Optimiser l'interface utilisateur mobile pour les membres de la famille

## Avancées récentes (19/06/2025)
- [x] Correction du schéma Prisma avec ajout des champs manquants
- [x] Correction des relations many-to-many entre Journey et User pour followers
- [x] Tests des API pour vérifier que tout fonctionne correctement
- [x] Ajout de scripts utilitaires pour tester les API
- [x] Amélioration du hook useJourneyUpdates avec typage TypeScript et gestion des événements
- [x] Ajout d'un composant RealTimeJourneyTracker pour le suivi en temps réel
- [x] Création d'une interface admin pour mettre à jour la position en temps réel
- [x] Développement de nouvelles routes API pour la gestion de position et statut
- [x] Création d'une page dédiée au suivi en temps réel des trajets
- [x] Mise à jour de ce TODO pour refléter les progrès
