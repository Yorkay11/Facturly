# Notifications push et VAPID

## Où souscrire dans l’app (frontend)

- **Page** : **Tableau de bord → Notifications** (`/[locale]/notifications`).
- Une carte **« Notifications push »** est toujours affichée en haut de la page. Elle indique :
  - **Activer les notifications** : bouton pour demander la permission et enregistrer l’abonnement (si le serveur expose une clé VAPID).
  - **Activées** : les push sont déjà activées.
  - **Refusées** : l’utilisateur a bloqué les notifications ; il doit les réautoriser dans les paramètres du navigateur.
  - **Non configurées côté serveur (clé VAPID manquante)** : le backend ne renvoie pas de clé publique VAPID ; le bouton d’activation n’apparaît pas tant que ce n’est pas configuré.

Sans clé VAPID côté backend, le bouton « Activer les notifications » n’apparaît jamais : c’est pour cela qu’on n’avait pas « vu l’endroit pour souscrire ».

---

## Gérer VAPID côté backend

La **clé VAPID** est gérée **uniquement côté serveur**. Le frontend ne fait qu’appeler l’API pour récupérer la clé publique et enregistrer l’abonnement.

### Ce que le backend doit faire

1. **Générer une paire de clés VAPID** (une seule fois, puis garder la même clé) :
   - En Node par exemple : `npm i web-push` puis `webpush.generateVAPIDKeys()`.
   - Tu obtiens une clé **publique** et une clé **privée**.

2. **Stocker la clé privée** de façon sécurisée (variable d’environnement ou secret manager), par ex. :
   - `VAPID_PRIVATE_KEY=...`  
   Ne jamais exposer la clé privée au frontend.

3. **Exposer la clé publique** via l’API :
   - **GET** `/notifications/vapid-public-key` (ou le chemin utilisé par le frontend)  
   - Réponse attendue : `{ "vapidPublicKey": "B..." }` (chaîne base64 de la clé publique).  
   - Si la clé n’est pas configurée, renvoyer `{ "vapidPublicKey": null }` — dans ce cas le frontend affiche « Non configurées côté serveur ».

4. **Enregistrer les abonnements** :
   - **POST** `/notifications/push-subscribe` avec le body envoyé par le frontend (endpoint + keys p256dh/auth + optionnel locale).
   - Stocker cet abonnement (endpoint + keys) pour envoyer plus tard les notifications avec la **clé privée** VAPID (via une lib comme `web-push`).

5. **(Optionnel)** Désinscription :
   - **POST** `/notifications/push-unsubscribe` avec `{ "endpoint": "..." }` pour supprimer l’abonnement côté serveur quand l’utilisateur désactive les notifications.

### Résumé

| Où | Rôle |
|----|------|
| **Frontend** | Page **Notifications** : affiche la carte « Notifications push », bouton « Activer les notifications » si VAPID dispo, envoi de l’abonnement à `push-subscribe`. |
| **Backend** | Générer et stocker la paire VAPID ; exposer la clé **publique** via `vapid-public-key` ; accepter `push-subscribe` / `push-unsubscribe` ; envoyer les push avec la clé **privée**. |

Une fois la clé publique renvoyée par le backend, l’endroit pour souscrire reste la page **Notifications** du tableau de bord, avec la carte dédiée en haut.
