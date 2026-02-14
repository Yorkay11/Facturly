import type { WhatsAppMessageStyle } from "@/services/api/types/invoice.types";

export interface WhatsAppMessageParams {
  invoiceNumber: string;
  amount: string;
  currency: string;
  dueDate?: string;
  companyName?: string;
  style?: WhatsAppMessageStyle;
}

/**
 * Génère le message WhatsApp selon le style choisi
 * Réplique la logique du backend pour l'aperçu
 */
export function generateWhatsAppMessage(params: WhatsAppMessageParams): string {
  const { invoiceNumber, amount, currency, dueDate, companyName, style = 'professional_warm' } = params;

  switch (style) {
    case 'direct':
      return `Bonjour 👋

Votre facture n°${invoiceNumber} (${amount} ${currency}) est prête.

📄 Accédez à la facture et payez en quelques secondes via le lien ci-dessous.

💳 Mobile Money accepté : Orange Money, MTN, Wave.

${dueDate ? `📅 Merci d'effectuer le règlement avant le ${dueDate}.\n\n` : ''}Merci pour votre réactivité 🙏`;

    case 'premium':
      return `Bonjour,

La facture n°${invoiceNumber}, d'un montant de ${amount} ${currency}, a été émise et est disponible en ligne.

📄 Consultez le document et procédez au règlement via le lien sécurisé ci-dessous.

💳 Paiement Mobile Money disponible (Orange Money, MTN, Wave).

${dueDate ? `📅 Échéance : ${dueDate}.\n\n` : ''}Nous vous remercions pour votre collaboration continue.`;

    case 'humane':
      return `Bonjour 👋

Nous espérons que vous allez bien.

Votre facture n°${invoiceNumber} d'un montant de ${amount} ${currency} est prête.

📄 Cliquez sur le lien pour la consulter et régler facilement.

💳 Paiement simple via Orange Money, MTN ou Wave.

${dueDate ? `📅 À régler avant le ${dueDate}.\n\n` : ''}Merci encore pour votre confiance et à très bientôt 😊`;

    case 'compact':
      return `Bonjour 👋

Facture n°${invoiceNumber} – ${amount} ${currency}

📄 Consultez et payez ici :
💳 Orange Money | MTN | Wave

${dueDate ? `📅 Échéance : ${dueDate}\n\n` : ''}Merci 🙏`;

    case 'professional_warm':
    default:
      return `Bonjour 👋

Nous vous informons que votre facture n°${invoiceNumber}, d'un montant de ${amount} ${currency}, est désormais disponible.

📄 Vous pouvez la consulter et effectuer le paiement en ligne via le lien ci-dessous.

${dueDate ? `📅 Date limite de paiement : ${dueDate}\n\n` : ''}💳 Paiement rapide via Mobile Money (Orange Money, MTN, Wave).

Nous restons à votre disposition pour toute question.
Merci pour votre confiance${companyName ? ` envers ${companyName}` : ''} 🤝`;
  }
}
