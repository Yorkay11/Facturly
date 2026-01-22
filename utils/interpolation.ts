/**
 * Utilitaires pour l'interpolation de variables dans les messages
 * Remplace {variable} et {{variable}} par leurs valeurs
 */

/**
 * Interpole les variables dans un message
 * Remplace {variable} et {{variable}} par leurs valeurs depuis un objet de données
 * 
 * @param message - Le message contenant des variables à interpoler
 * @param data - L'objet contenant les valeurs pour les variables
 * @param locale - La locale pour le formatage (optionnel, défaut: 'fr')
 * @returns Le message avec les variables remplacées
 */
export function interpolateMessage(
  message: string,
  data?: Record<string, unknown>,
  locale: string = 'fr'
): string {
  if (!message) return message;
  if (!data) return message;
  
  // Remplacer {variable} et {{variable}} par leurs valeurs
  return message.replace(/\{\{?\s*([a-zA-Z0-9_.]+)\s*\}\}?/g, (match, key) => {
    // Chercher la valeur dans data
    const parts = String(key).split('.');
    let value: any = data;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return match; // Retourner la variable originale si non trouvée
      }
    }
    
    // Formater les valeurs spéciales
    if (value === null || value === undefined) {
      return match; // Garder la variable si la valeur est absente
    }
    
    // Formater les montants avec devise si nécessaire
    if (key === 'amount' || key === 'totalAmount' || key === 'remaining') {
      const currency = data.currency as string | undefined;
      if (currency && typeof value === 'string') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 2,
          }).format(numValue);
        }
      }
    }
    
    return String(value);
  });
}

/**
 * Interpole les variables dans un message avec formatage de devise automatique
 * Utilise les données de l'objet pour détecter automatiquement la devise
 */
export function interpolateMessageWithCurrency(
  message: string,
  data?: Record<string, unknown>,
  locale: string = 'fr'
): string {
  return interpolateMessage(message, data, locale);
}
