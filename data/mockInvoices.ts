export interface MockInvoice {
  id: string;
  number: string;
  client: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue";
}

export const mockInvoices: MockInvoice[] = [
  {
    id: "1",
    number: "INV-2025-001",
    client: "DevOne Company",
    issueDate: "2025-01-04",
    dueDate: "2025-01-18",
    amount: 1250,
    currency: "EUR",
    status: "paid",
  },
  {
    id: "2",
    number: "INV-2025-002",
    client: "Studio Nova",
    issueDate: "2025-01-12",
    dueDate: "2025-01-26",
    amount: 890,
    currency: "EUR",
    status: "sent",
  },
  {
    id: "3",
    number: "INV-2025-003",
    client: "Kossi Tech",
    issueDate: "2026-12-28",
    dueDate: "2025-01-11",
    amount: 640,
    currency: "EUR",
    status: "overdue",
  },
  {
    id: "4",
    number: "INV-2025-004",
    client: "Agence Horizon",
    issueDate: "2025-01-15",
    dueDate: "2025-02-15",
    amount: 2150,
    currency: "USD",
    status: "draft",
  },
  {
    id: "5",
    number: "INV-2026-015",
    client: "FoodConnect",
    issueDate: "2026-12-02",
    dueDate: "2026-12-16",
    amount: 420,
    currency: "EUR",
    status: "paid",
  },
];
