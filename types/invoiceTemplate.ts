export interface InvoiceTemplateMeta {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  backgroundColor?: string;
  textColor?: string;
  backendTemplateName?: string; // Nom du template côté backend pour la génération PDF
}

/**
 * Obtient le nom du template backend à partir de l'ID frontend
 * @param templateId - ID du template frontend
 * @returns Nom du template backend ou "invoice" par défaut
 */
export function getBackendTemplateName(templateId: string): string {
  const template = invoiceTemplates.find((t) => t.id === templateId);
  if (template?.backendTemplateName) {
    return template.backendTemplateName;
  }
  // Si pas de mapping, retourne "invoice" par défaut
  return "invoice";
}

/**
 * Obtient le template frontend à partir du nom du template backend
 * @param backendTemplateName - Nom du template backend (ex: "invoice", "invoice-modern", "invoice-classic")
 * @returns Template frontend ou le template par défaut
 */
export function getFrontendTemplateFromBackend(backendTemplateName: string): InvoiceTemplateMeta {
  // Chercher d'abord par backendTemplateName exact
  const template = invoiceTemplates.find(
    (t) => t.backendTemplateName === backendTemplateName
  );
  
  if (template) {
    return template;
  }
  
  // Si pas trouvé et que c'est "invoice", retourner le template par défaut
  if (backendTemplateName === "invoice") {
    return invoiceTemplates.find((t) => t.id === "invoice") || invoiceTemplates[0];
  }
  
  // Sinon, retourner le premier template par défaut
  return invoiceTemplates[0];
}

export const invoiceTemplates: InvoiceTemplateMeta[] = [
  {
    id: "invoice",
    name: "Sidebar Colorée",
    description: "Template avec sidebar colorée et informations organisées.",
    accentColor: "#6C4AB6",
    backgroundColor: "#ffffff",
    textColor: "#1F1B2E",
    backendTemplateName: "invoice", // Template par défaut backend
  },
  {
    id: "professional",
    name: "Professionnel",
    description: "Style professionnel avec header sombre et design épuré.",
    accentColor: "#2c3e50",
    backgroundColor: "#ffffff",
    textColor: "#2c3e50",
    backendTemplateName: "invoice-professional",
  },
  {
    id: "modern",
    name: "Moderne",
    description: "Design moderne avec séparateur et mise en page aérée.",
    accentColor: "#6C4AB6",
    backgroundColor: "#ffffff",
    textColor: "#1F1B2E",
    backendTemplateName: "invoice-modern",
  },
  {
    id: "minimal",
    name: "Minimaliste",
    description: "Template épuré et minimaliste, optimisé pour l'impression.",
    accentColor: "#000000",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    backendTemplateName: "invoice-minimal",
  },
  {
    id: "elegant",
    name: "Élégant",
    description: "Style élégant avec police serif et accents dorés.",
    accentColor: "#d4af37",
    backgroundColor: "#ffffff",
    textColor: "#2c3e50",
    backendTemplateName: "invoice-elegant",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Template compact avec style monospace, idéal pour l'impression.",
    accentColor: "#000000",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    backendTemplateName: "invoice-compact",
  },
  {
    id: "colorful",
    name: "Coloré",
    description: "Design vibrant avec dégradés colorés et style moderne.",
    accentColor: "#667eea",
    backgroundColor: "#ffffff",
    textColor: "#2d3748",
    backendTemplateName: "invoice-colorful",
  },
  {
    id: "classicSerif",
    name: "Classique Serif",
    description: "Template classique avec police serif et bordures noires.",
    accentColor: "#000000",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    backendTemplateName: "invoice-classic",
  },
];
