# Système de Relances de Factures

Ce document décrit le système de relances (reminders) pour les factures impayées.

## Vue d'ensemble

Le système permet d'envoyer des relances automatiques et manuelles pour les factures en retard, avec un suivi complet de l'historique.

## Fonctionnalités

- ✅ **Relances manuelles** : L'utilisateur peut envoyer une relance manuellement depuis l'interface
- ✅ **Relances automatiques** : Envoi automatique selon un calendrier défini (cron job)
- ✅ **Historique complet** : Traçabilité de toutes les relances envoyées
- ✅ **Templates personnalisés** : Messages différents selon le numéro de relance (plus fermes)
- ✅ **Limite de relances** : Maximum 3 relances par facture

## Règles de relances

### Calendrier
- **1ère relance** : 3 jours après l'échéance
- **2ème relance** : 7 jours après l'échéance
- **3ème relance** : 7 jours après l'échéance (ou selon votre configuration)

### Conditions
- La facture doit être en statut `SENT` ou `OVERDUE`
- La facture doit avoir une date d'échéance (`dueDate`)
- La facture ne doit pas être déjà payée
- Maximum 3 relances par facture

## Endpoints

### Envoyer une relance manuelle

**POST** `/invoices/:id/remind`

Envoie une relance manuelle pour une facture spécifique.

**Response (200 OK):**
```json
{
  "success": true,
  "reminderNumber": 1,
  "reminderId": "uuid"
}
```

**Errors:**
- `404` - Facture introuvable
- `400` - Facture déjà payée, pas de date d'échéance, ou maximum de relances atteint

### Historique des relances

**GET** `/invoices/:id/reminders`

Retourne l'historique complet des relances pour une facture.

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "reminderNumber": 1,
    "sentAt": "2025-12-06T09:00:00Z",
    "reminderType": "automatic",
    "dueDate": "2025-12-01",
    "daysAfterDue": 3,
    "recipientEmail": "client@example.com",
    "createdAt": "2025-12-06T09:00:00Z"
  },
  {
    "id": "uuid",
    "reminderNumber": 2,
    "sentAt": "2025-12-10T09:00:00Z",
    "reminderType": "manual",
    "dueDate": "2025-12-01",
    "daysAfterDue": 7,
    "recipientEmail": "client@example.com",
    "createdAt": "2025-12-10T09:00:00Z"
  }
]
```

## Templates d'email

### 1ère relance (3 jours)
- Ton : Amical
- Couleur : Bleu (#3498db)
- Message : Rappel amical du retard de paiement

### 2ème relance (7 jours)
- Ton : Formel
- Couleur : Orange (#f39c12)
- Message : Rappel formel avec demande de règlement

### 3ème relance (7 jours)
- Ton : Urgent
- Couleur : Rouge (#e74c3c)
- Message : Dernier rappel avec demande urgente de règlement

## Relances automatiques (Cron Job)

Les relances automatiques s'exécutent tous les jours à 9h00.

### Installation

Pour activer les relances automatiques, installez `@nestjs/schedule` :

```bash
npm install @nestjs/schedule
```

### Configuration

1. Importer `ScheduleModule` dans `AppModule` :
```typescript
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // ... autres modules
  ],
})
export class AppModule {}
```

2. Décommenter le décorateur `@Cron` dans `reminder-scheduler.service.ts`

3. Ajouter le scheduler au module :
```typescript
// Dans invoicing.module.ts
providers: [
  InvoicingService,
  ReminderService,
  ReminderSchedulerService, // Ajouter cette ligne
],
```

### Personnalisation de l'heure

Pour changer l'heure d'exécution, modifiez le cron dans `reminder-scheduler.service.ts` :

```typescript
@Cron('0 9 * * *') // Tous les jours à 9h00
// Autres exemples :
// @Cron('0 8 * * *') // Tous les jours à 8h00
// @Cron('0 */6 * * *') // Toutes les 6 heures
```

## Base de données

### Table `invoice_reminders`

La table stocke l'historique complet des relances :

- `id` - UUID
- `invoice_id` - Référence à la facture
- `reminder_number` - Numéro de la relance (1, 2, ou 3)
- `sent_at` - Date et heure d'envoi
- `reminder_type` - 'manual' ou 'automatic'
- `due_date` - Date d'échéance de la facture
- `days_after_due` - Nombre de jours après échéance
- `recipient_email` - Email du destinataire
- `created_at` / `updated_at` - Horodatage

### Migration

Exécuter la migration pour créer la table :

```bash
npm run migration:run
```

## Exemples d'utilisation

### Relance manuelle via API

```bash
POST /invoices/{invoiceId}/remind
Authorization: Bearer {token}

Response:
{
  "success": true,
  "reminderNumber": 1,
  "reminderId": "uuid"
}
```

### Récupérer l'historique

```bash
GET /invoices/{invoiceId}/reminders
Authorization: Bearer {token}

Response:
[
  {
    "id": "uuid",
    "reminderNumber": 1,
    "sentAt": "2025-12-06T09:00:00Z",
    "reminderType": "automatic",
    ...
  }
]
```

## Notes importantes

1. **Statut de la facture** : Les factures en retard sont automatiquement marquées comme `OVERDUE`
2. **Limite de relances** : Une fois 3 relances envoyées, aucune autre relance ne peut être envoyée
3. **Email requis** : Une facture doit avoir un email de destinataire pour être relancée
4. **Paiement partiel** : Le montant restant dû est calculé automatiquement dans l'email

## Troubleshooting

### Les relances automatiques ne s'exécutent pas

1. Vérifier que `@nestjs/schedule` est installé
2. Vérifier que `ScheduleModule` est importé dans `AppModule`
3. Vérifier que le décorateur `@Cron` n'est pas commenté
4. Vérifier les logs pour voir les erreurs

### Une relance ne peut pas être envoyée

- Vérifier que la facture n'est pas déjà payée
- Vérifier qu'il y a un email de destinataire
- Vérifier que le maximum de 3 relances n'est pas atteint
- Vérifier que la facture a une date d'échéance

