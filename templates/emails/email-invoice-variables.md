# Email facture (paiement client) – FR + EN

Même principe que l’email waitlist : **une version FR et une version EN** dans le même email. Le backend met **la langue du client en premier** (FR puis EN, ou EN puis FR), puis le séparateur, puis l’autre langue.

## Structure du template

- `<!-- INVOICE_EMAIL_FR -->` … `<!-- END INVOICE_EMAIL_FR -->` : email complet en français
- `<!-- INVOICE_EMAIL_SEPARATOR -->` … `<!-- END INVOICE_EMAIL_SEPARATOR -->` : séparateur « English version below / Version anglaise ci-dessous »
- `<!-- INVOICE_EMAIL_EN -->` … `<!-- END INVOICE_EMAIL_EN -->` : email complet en anglais

## Placeholders (à remplacer dans les deux blocs)

| Placeholder        | Exemple     | Description                |
|--------------------|-------------|----------------------------|
| `{{clientName}}`   | Marie, John | Nom du client              |
| `{{invoiceNumber}}`| FAC-002     | Numéro de facture          |
| `{{totalAmount}}`  | 15 000      | Montant total (formaté)    |
| `{{currency}}`      | XOF         | Code devise                |
| `{{dueDate}}`      | 28/02/2026  | Date d’échéance (formatée) |
| `{{payUrl}}`       | https://... | Lien de paiement           |
| `{{logoUrl}}`       | https://... | URL du logo (workspace ou Facturly) |

## Comportement backend

1. Lire le fichier `email-invoice.html` et extraire les trois parties (FR, séparateur, EN).
2. Remplacer les placeholders dans le bloc FR et dans le bloc EN (mêmes valeurs).
3. Selon la langue du client (`locale` ou préférence) :
   - si **fr** : envoyer `htmlFr + separator + htmlEn`
   - si **en** (ou défaut) : envoyer `htmlEn + separator + htmlFr`
4. Objet suggéré : `Paiement requis - Facture {{invoiceNumber}} / Payment required - Invoice {{invoiceNumber}}`
