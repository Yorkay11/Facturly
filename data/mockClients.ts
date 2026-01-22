export interface MockClient {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  invoicesCount: number;
  lastInvoiceDate: string;
}

export const mockClients: MockClient[] = [
  {
    id: "c1",
    name: "Alice Johnson",
    company: "Studio Nova",
    email: "alice.johnson@example.com",
    phone: "+228 90 12 34 56",
    invoicesCount: 8,
    lastInvoiceDate: "2025-01-18",
  },
  {
    id: "c2",
    name: "Jean-Baptiste K.",
    company: "Kossi Tech",
    email: "jb.kossi@kossitech.tg",
    invoicesCount: 3,
    lastInvoiceDate: "2025-01-12",
  },
  {
    id: "c3",
    name: "Marie Dupont",
    company: "Agence Horizon",
    email: "marie@agencehorizon.fr",
    phone: "+33 6 88 24 57 10",
    invoicesCount: 12,
    lastInvoiceDate: "2025-01-05",
  },
  {
    id: "c4",
    name: "Samuel Dossou",
    company: "FoodConnect",
    email: "samuel.d@foodconnect.tg",
    invoicesCount: 5,
    lastInvoiceDate: "2026-12-22",
  },
  {
    id: "c5",
    name: "Laura M.",
    company: "LM Creative",
    email: "contact@lmcreative.io",
    invoicesCount: 2,
    lastInvoiceDate: "2026-11-30",
  },
];
