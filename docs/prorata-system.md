# Système de Prorata - Changements de Plan

Ce document explique le fonctionnement du système de prorata lors des changements de plan d'abonnement dans Facturly.

## 📋 Vue d'ensemble

Le **prorata** (ou prorata temporis) est un calcul proportionnel qui permet de facturer équitablement les changements de plan en cours de période de facturation. Il garantit que vous ne payez que pour la partie de la période que vous utilisez avec chaque plan.

## 🎯 Principe de base

Lorsque vous changez de plan en cours de période :

1. **Valeur utilisée** : Calcul de la valeur du plan actuel pour la période déjà écoulée
2. **Valeur restante** : Calcul de la valeur du nouveau plan pour la période restante
3. **Prorata** : Différence entre ces deux valeurs (à payer maintenant ou crédit à appliquer)

## 💡 Exemples concrets

### Exemple 1 : Passage du plan Gratuit au plan Pro (milieu du mois)

**Situation :**
- Plan actuel : Gratuit (0,00 €/mois)
- Nouveau plan : Pro (29,00 €/mois)
- Date de changement : 15 janvier (milieu du mois)
- Période de facturation : 1er janvier - 31 janvier (31 jours)

**Calcul :**
- Jours écoulés : 15 jours
- Jours restants : 16 jours
- Valeur utilisée (plan gratuit) : 0,00 €
- Valeur restante (plan Pro) : (29,00 € ÷ 31 jours) × 16 jours = **14,97 €**
- **Prorata à payer : 14,97 €**

**Résultat :**
- Vous payez **14,97 €** maintenant pour le reste du mois
- À partir du 1er février, vous paierez **29,00 €/mois** normalement

---

### Exemple 2 : Passage du plan Pro au plan Entreprise (début du mois)

**Situation :**
- Plan actuel : Pro (29,00 €/mois)
- Nouveau plan : Entreprise (199,00 €/mois)
- Date de changement : 5 janvier (5 jours écoulés)
- Période de facturation : 1er janvier - 31 janvier (31 jours)

**Calcul :**
- Jours écoulés : 5 jours
- Jours restants : 26 jours
- Valeur utilisée (plan Pro) : (29,00 € ÷ 31 jours) × 5 jours = 4,68 €
- Valeur restante (plan Entreprise) : (199,00 € ÷ 31 jours) × 26 jours = 166,90 €
- **Prorata à payer : 166,90 € - 4,68 € = 162,22 €**

**Résultat :**
- Vous payez **162,22 €** maintenant pour le reste du mois
- À partir du 1er février, vous paierez **199,00 €/mois** normalement

---

### Exemple 3 : Rétrogradation du plan Pro au plan Gratuit (crédit)

**Situation :**
- Plan actuel : Pro (29,00 €/mois)
- Nouveau plan : Gratuit (0,00 €/mois)
- Date de changement : 20 janvier (20 jours écoulés)
- Période de facturation : 1er janvier - 31 janvier (31 jours)

**Calcul :**
- Jours écoulés : 20 jours
- Jours restants : 11 jours
- Valeur utilisée (plan Pro) : (29,00 € ÷ 31 jours) × 20 jours = 18,71 €
- Valeur restante (plan Gratuit) : 0,00 €
- **Crédit à appliquer : 0,00 € - 18,71 € = -18,71 €**

**Résultat :**
- Vous recevez un **crédit de 18,71 €** (appliqué sur votre prochaine facture)
- À partir du 1er février, vous n'aurez plus de frais (plan gratuit)

---

### Exemple 4 : Passage d'un plan mensuel à un plan annuel

**Situation :**
- Plan actuel : Pro Mensuel (29,00 €/mois)
- Nouveau plan : Pro Annuel (288,00 €/an = 24,00 €/mois)
- Date de changement : 15 janvier (milieu du mois)
- Période de facturation : 1er janvier - 31 janvier (31 jours)

**Calcul :**
- Jours écoulés : 15 jours
- Jours restants : 16 jours
- Prix journalier plan actuel : 29,00 € ÷ 31 jours = 0,935 €/jour
- Prix journalier plan annuel : 288,00 € ÷ 365 jours = 0,789 €/jour
- Valeur utilisée (plan mensuel) : 0,935 € × 15 jours = 14,03 €
- Valeur restante (plan annuel) : 0,789 € × 16 jours = 12,62 €
- **Prorata : 12,62 € - 14,03 € = -1,41 €** (crédit)

**Résultat :**
- Vous recevez un **crédit de 1,41 €**
- À partir du 1er février, vous paierez **288,00 €/an** (facturé annuellement)

---

### Exemple 5 : Passage d'un plan annuel à un plan mensuel

**Situation :**
- Plan actuel : Pro Annuel (288,00 €/an)
- Nouveau plan : Pro Mensuel (29,00 €/mois)
- Date de changement : 15 janvier (milieu de l'année, 15 jours écoulés sur 31 jours de janvier)
- Période de facturation : 1er janvier - 31 janvier (31 jours)

**Calcul :**
- Jours écoulés : 15 jours
- Jours restants : 16 jours
- Prix journalier plan annuel : 288,00 € ÷ 365 jours = 0,789 €/jour
- Prix journalier plan mensuel : 29,00 € ÷ 31 jours = 0,935 €/jour
- Valeur utilisée (plan annuel) : 0,789 € × 15 jours = 11,84 €
- Valeur restante (plan mensuel) : 0,935 € × 16 jours = 14,96 €
- **Prorata : 14,96 € - 11,84 € = 3,12 €**

**Résultat :**
- Vous payez **3,12 €** maintenant pour le reste du mois
- À partir du 1er février, vous paierez **29,00 €/mois** normalement

## 🔄 API et Réponse

### Endpoint de prévisualisation

**POST** `/subscriptions/preview`

**Request Body:**
```json
{
  "planId": "uuid"
}
```

**Response (200 OK):**
```json
{
  "currentPlan": {
    "id": "uuid",
    "code": "free",
    "name": "Gratuit",
    "price": "0.00",
    "billingInterval": "monthly"
  },
  "newPlan": {
    "id": "uuid",
    "code": "pro",
    "name": "Pro",
    "price": "29.00",
    "billingInterval": "monthly"
  },
  "prorationAmount": "14.97",
  "creditAmount": null,
  "prorationDetails": {
    "daysElapsed": 15,
    "daysRemaining": 16,
    "totalDaysInPeriod": 31,
    "usedValue": "0.00",
    "remainingValue": "14.97",
    "isUpgrade": true,
    "isDowngrade": false,
    "intervalChange": false
  },
  "nextBillingDate": "2025-02-01T00:00:00Z",
  "invoiceLimitChange": {
    "current": 10,
    "new": null
  }
}
```

**Exemple avec crédit (downgrade) :**
```json
{
  "currentPlan": { ... },
  "newPlan": { ... },
  "prorationAmount": "0.00",
  "creditAmount": "18.71",
  "prorationDetails": {
    "daysElapsed": 20,
    "daysRemaining": 11,
    "totalDaysInPeriod": 31,
    "usedValue": "18.71",
    "remainingValue": "0.00",
    "isUpgrade": false,
    "isDowngrade": true,
    "intervalChange": false
  },
  ...
}
```

### Comportement dans l'interface frontend

Lorsque vous sélectionnez un nouveau plan, le frontend doit :

1. **Appeler l'endpoint** `POST /subscriptions/preview` avec le `planId`
2. **Afficher les informations** :
   - Plan actuel vs nouveau plan (avec intervalle de facturation)
   - Montant à payer (`prorationAmount`) ou crédit (`creditAmount`)
   - Détails du calcul (optionnel, pour transparence)
   - Date de prochaine facturation (`nextBillingDate`)
   - Changement de limite de factures (`invoiceLimitChange`)
3. **Gérer les cas spéciaux** :
   - Si `creditAmount` est présent : afficher "Crédit de X € à appliquer"
   - Si `prorationAmount` est "0.00" et pas de crédit : pas de paiement immédiat
   - Si `intervalChange: true` : informer l'utilisateur du changement d'intervalle
   - Si `isDowngrade: true` : afficher un message de confirmation

## 📊 Formule de calcul

### Plans avec même intervalle de facturation

```
Prix journalier = Prix du plan / Jours dans la période
Valeur utilisée = Prix journalier plan actuel × Jours écoulés
Valeur restante = Prix journalier nouveau plan × Jours restants
Prorata = Valeur restante - Valeur utilisée
```

### Plans avec intervalles différents

**Plan mensuel :**
```
Prix journalier = Prix mensuel / Jours dans la période actuelle
```

**Plan annuel :**
```
Prix journalier = Prix annuel / 365 jours
```

**Puis :**
```
Valeur utilisée = Prix journalier plan actuel × Jours écoulés
Valeur restante = Prix journalier nouveau plan × Jours restants
Prorata = Valeur restante - Valeur utilisée
```

Où :
- **Jours écoulés** : Nombre de jours depuis le début de la période actuelle
- **Jours restants** : Nombre de jours jusqu'à la fin de la période actuelle
- **Jours total période** : 
  - Pour mensuel : Nombre exact de jours dans la période (28-31 jours selon le mois)
  - Pour annuel : 365 jours (utilisé pour le calcul du prix journalier)

## ⚙️ Cas particuliers

### Changement le premier jour de la période

Si vous changez de plan le premier jour de votre période de facturation :
- **Prorata = Prix du nouveau plan** (pas de calcul proportionnel nécessaire)
- Vous payez le prix complet du nouveau plan

### Changement le dernier jour de la période

Si vous changez de plan le dernier jour de votre période :
- **Prorata ≈ 0 €** (très faible montant)
- Le nouveau plan prend effet à la période suivante

### Plans gratuits

- Passage **vers** un plan gratuit : Crédit basé sur la valeur non utilisée du plan payant
- Passage **depuis** un plan gratuit : Prorata basé uniquement sur le nouveau plan payant

## 🔐 Intégration avec Stripe

Pour les plans payants, le prorata est calculé par le backend et géré par Stripe lors de la création de la session de checkout :

1. **Backend** : Calcule le prorata exact basé sur les jours réels
2. **Stripe** : Crée une session de checkout avec le montant prorata
3. **Paiement** : Vous payez le prorata immédiatement
4. **Factures suivantes** : Au prix normal du nouveau plan (mensuel ou annuel selon le plan)

**Note importante :** 
- Le calcul du prorata est effectué côté backend avant la création de la session Stripe
- Stripe gère automatiquement les changements de plan et applique le prorata lors de la facturation
- Les crédits (prorata négatif) sont retournés dans la réponse API mais doivent être gérés manuellement ou via Stripe Credits

## 📝 Notes importantes

- Le prorata est calculé automatiquement par le backend avec une précision basée sur les jours réels
- Les montants sont arrondis à 2 décimales
- Le prorata ne s'applique qu'aux changements de plan en cours de période
- Les changements de plan prennent effet immédiatement après le paiement
- Les crédits (prorata négatif) sont calculés et retournés dans l'API, mais nécessitent une gestion manuelle ou via Stripe Credits
- Les plans annuels utilisent 365 jours pour le calcul du prix journalier
- Les plans mensuels utilisent le nombre exact de jours dans la période actuelle

## 🎓 Bonnes pratiques

1. **Vérifiez toujours la prévisualisation** avant de confirmer un changement de plan
2. **Comprenez la différence** entre le prorata (paiement immédiat) et le prix mensuel (paiements futurs)
3. **Planifiez vos changements** : Changer en début de période minimise le prorata
4. **Consultez la date de facturation** : La prochaine facturation normale est indiquée dans le modal

## 🔍 Dépannage

### Le prorata semble incorrect

- Vérifiez que la date de changement est correcte
- Assurez-vous que les prix des plans sont à jour
- Contactez le support si le calcul semble anormal

### Questions fréquentes

**Q : Pourquoi le prorata est-il différent du prix mensuel ?**
R : Le prorata est proportionnel au temps restant dans la période, pas au prix mensuel complet.

**Q : Puis-je annuler un changement de plan ?**
R : Oui, vous pouvez annuler votre abonnement, mais le prorata déjà payé n'est pas remboursable automatiquement.

**Q : Le prorata s'applique-t-il aux plans annuels ?**
R : Oui, le calcul est proportionnel à la période restante (en jours) de votre abonnement annuel. Le prix journalier d'un plan annuel est calculé en divisant le prix annuel par 365 jours.

**Q : Que se passe-t-il si je change d'un plan mensuel à un plan annuel (ou vice versa) ?**
R : Le système calcule le prorata en tenant compte de l'intervalle de facturation de chaque plan. Le prix journalier est calculé différemment selon l'intervalle (mensuel : prix / jours dans la période, annuel : prix / 365).

**Q : Comment sont gérés les crédits (prorata négatif) ?**
R : Les crédits sont calculés et retournés dans la réponse API (`creditAmount`). Ils peuvent être appliqués sur la prochaine facture ou gérés via Stripe Credits selon votre configuration.

## 🔧 Implémentation technique

### Calcul côté backend

Le calcul du prorata est effectué dans `BillingService.previewSubscriptionChange()` :

1. **Récupération des données** : Plan actuel, nouveau plan, période de facturation
2. **Calcul des jours** : Jours écoulés, restants, total dans la période
3. **Calcul des prix journaliers** :
   - Plans mensuels : `prix / jours dans la période`
   - Plans annuels : `prix / 365`
4. **Calcul des valeurs** : Utilisée (plan actuel) et restante (nouveau plan)
5. **Calcul du prorata** : `valeur restante - valeur utilisée`
6. **Gestion des crédits** : Si prorata négatif, retourné dans `creditAmount`

### Gestion des intervalles différents

Lors d'un changement entre plan mensuel et annuel :
- Le prix journalier est calculé selon l'intervalle de chaque plan
- Le calcul reste proportionnel aux jours restants dans la période actuelle
- La prochaine facturation utilisera l'intervalle du nouveau plan

### Limitations actuelles

- Les crédits (prorata négatif) sont calculés mais nécessitent une gestion manuelle ou via Stripe Credits
- Le système ne gère pas automatiquement l'application des crédits sur la prochaine facture
- Pour les plans gratuits, le prorata est toujours positif (pas de crédit pour passage vers gratuit)

---

**Dernière mise à jour :** Janvier 2025  
**Version :** 2.0 (Mise à jour avec implémentation réelle)

