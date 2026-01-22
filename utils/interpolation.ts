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
  
  // Remplacer {variable} et {{variable}} par leurs valeurs
  let result = message.replace(/\{\{?\s*([a-zA-Z0-9_.]+)\s*\}\}?/g, (match, key) => {
    // Si on a des données, chercher la valeur
    if (data) {
      const parts = String(key).split('.');
      let value: any = data;
      
      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          // Variable non trouvée dans data - la supprimer
          return '';
        }
      }
      
      // Formater les valeurs spéciales
      if (value === null || value === undefined || value === '') {
        // Variable vide - la supprimer complètement
        return '';
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
    }
    
    // Si pas de data, supprimer toutes les variables (elles sont probablement déjà interpolées côté backend mais vides)
    return '';
  });
  
  // Nettoyer les espaces multiples et les ponctuations en double causées par la suppression de variables
  result = result.replace(/\s+/g, ' ').trim();
  result = result.replace(/\s*,\s*,/g, ','); // Supprimer les virgules doubles
  result = result.replace(/\s*\.\s*\./g, '.'); // Supprimer les points doubles
  result = result.replace(/\s+([,\.])/g, '$1'); // Supprimer les espaces avant virgules/points
  result = result.replace(/\s+\)/g, ')'); // Supprimer les espaces avant parenthèses fermantes
  result = result.replace(/\(\s+/g, '('); // Supprimer les espaces après parenthèses ouvrantes
  result = result.replace(/\(\s*\)/g, ''); // Supprimer les parenthèses vides
  result = result.replace(/\s+/g, ' ').trim(); // Nettoyer à nouveau les espaces multiples
  
  return result;
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
