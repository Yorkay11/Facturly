export interface InvoiceTemplateMeta {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  backgroundColor?: string;
  textColor?: string;
}

export const invoiceTemplates: InvoiceTemplateMeta[] = [
  {
    id: "classic",
    name: "Classique Violet",
    description: "Style sobre avec accent violet pour Facturly.",
    accentColor: "#6C4AB6",
    backgroundColor: "#F5F2FF",
    textColor: "#1F1B2E",
  },
  {
    id: "bold",
    name: "Violet Pastel",
    description: "Contraste doux avec bandeau violet clair.",
    accentColor: "#A18CFF",
    backgroundColor: "#F9F7FF",
    textColor: "#2A1E5C",
  },
];
