export interface MockReminder {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  currency: string;
  dueDate: string;
  lastAction: string;
  status: "pending" | "in_progress" | "resolved";
}

export const mockReminders: MockReminder[] = [
  {
    id: "r1",
    invoiceNumber: "INV-2025-004",
    client: "Agence Horizon",
    amount: 2150,
    currency: "USD",
    dueDate: "2025-02-15",
    lastAction: "Email envoyé le 18/01",
    status: "pending",
  },
  {
    id: "r2",
    invoiceNumber: "INV-2025-003",
    client: "Kossi Tech",
    amount: 640,
    currency: "EUR",
    dueDate: "2025-01-11",
    lastAction: "Relance téléphonique le 20/01",
    status: "in_progress",
  },
  {
    id: "r3",
    invoiceNumber: "INV-2024-015",
    client: "FoodConnect",
    amount: 420,
    currency: "EUR",
    dueDate: "2024-12-16",
    lastAction: "Relance automatique 30/12",
    status: "resolved",
  },
];
