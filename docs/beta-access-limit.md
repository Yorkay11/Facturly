# Limiter l’accès bêta à 100 utilisateurs

Pour le lancement bêta, le backend peut limiter le nombre total d’inscriptions.

---

## Configuration

Dans l’environnement (ex: `.env`), définir :

- `BETA_MAX_USERS=100`

Si `BETA_MAX_USERS` n’est **pas** défini (ou vide), la limite est **désactivée**.

---

## Comportement

Lors de `POST /auth/register` :
- si le nombre total d’utilisateurs en base est **>= BETA_MAX_USERS**
  - l’API renvoie **403 Forbidden**
  - message : “La bêta est complète (limite: X utilisateurs).”

---

## Endpoint public (suivi bêta)

Pour afficher le compteur côté landing / waitlist :

- **GET** `/public/beta`

Réponse :
- `enabled`: boolean
- `maxUsers`: number | null
- `currentUsers`: number
- `remaining`: number | null
- `isFull`: boolean

---

## Notes

- La limite est globale (tous les utilisateurs).
- C’est un mécanisme simple pour une bêta privée.


