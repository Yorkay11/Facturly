import { Item } from "@/types/items";
import { InvoiceTemplateMeta } from "@/types/invoiceTemplate";
import { Workspace, Client } from "@/services/facturlyApi";

export interface InvoiceTemplateProps {
  metadata: {
    receiver: string;
    subject: string;
    issueDate?: Date;
    dueDate?: Date;
    notes?: string;
  };
  workspace?: Workspace;
  client?: Client;
  items: Item[];
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  formatAmount: (value: number) => string;
  formatDate: (value?: Date) => string;
  template: InvoiceTemplateMeta;
}
