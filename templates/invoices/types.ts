import { Item } from "@/types/items";
import { InvoiceTemplateMeta } from "@/types/invoiceTemplate";

export interface InvoiceTemplateProps {
  metadata: {
    receiver: string;
    subject: string;
    issueDate?: Date;
    dueDate?: Date;
    notes?: string;
  };
  items: Item[];
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  formatAmount: (value: number) => string;
  formatDate: (value?: Date) => string;
  template: InvoiceTemplateMeta;
}
