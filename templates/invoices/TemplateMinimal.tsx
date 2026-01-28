import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceTemplateProps } from "./types";

const TemplateMinimal = ({
  metadata,
  workspace,
  client,
  items,
  subtotal,
  vatAmount,
  totalAmount,
  formatAmount,
  formatDate,
  template,
}: InvoiceTemplateProps) => {
  // Construire l'adresse de l'entreprise
  const workspaceAddress = workspace
    ? [workspace.city, workspace.country].filter(Boolean).join(", ")
    : "-";

  // Construire l'adresse du client
  const clientAddress = client
    ? [client.city, client.country].filter(Boolean).join(", ")
    : "-";

  return (
    <div
      className="max-w-[768px] mx-auto bg-white p-6"
      style={{
        color: template.textColor || "#1F1B2E",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-2xl font-bold mb-1">FACTURE</h1>
          <p className="text-xs opacity-60">#{metadata.subject || "N/A"}</p>
        </div>
        <div className="text-right text-xs">
          <p className="mb-0.5">
            <strong className="font-semibold">Émise :</strong> {formatDate(metadata.issueDate)}
          </p>
          <p>
            <strong className="font-semibold">Échéance :</strong> {formatDate(metadata.dueDate)}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-xs">
        <div>
          <p className="font-semibold mb-1">Entreprise</p>
          <p className="mb-1">{workspace?.name || "Nom de l'entreprise"}</p>
          <p className="opacity-70">{workspaceAddress}</p>
        </div>
        <div>
          <p className="font-semibold mb-1">Client</p>
          <p className="mb-1">{metadata.receiver || client?.name || "Nom client"}</p>
          <p className="opacity-70">{clientAddress}</p>
        </div>
      </div>

      {/* Items Table */}
      <Table className="border-t border-b border-slate-200 mb-6 text-xs">
        <TableHeader>
          <TableRow className="uppercase opacity-60 hover:bg-transparent">
            <TableHead className="py-2 px-0 text-left font-semibold text-[11px]">Description</TableHead>
            <TableHead className="py-2 px-0 text-right font-semibold text-[11px]">Qté</TableHead>
            <TableHead className="py-2 px-0 text-right font-semibold text-[11px]">PU</TableHead>
            <TableHead className="py-2 px-0 text-right font-semibold text-[11px]">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length ? (
            items.map((item) => (
              <TableRow key={item.id} className="border-t border-slate-200">
                <TableCell className="py-2 px-0 align-top">{item.description}</TableCell>
                <TableCell className="py-2 px-0 text-right align-top">{item.quantity}</TableCell>
                <TableCell className="py-2 px-0 text-right align-top">
                  {formatAmount(item.unitPrice)}
                </TableCell>
                <TableCell className="py-2 px-0 text-right align-top font-medium">
                  {formatAmount(item.unitPrice * item.quantity)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-5 opacity-60 text-xs"
              >
                Aucune ligne de facture
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Totals Section */}
      <div className="flex justify-end mt-6">
        <div className="w-64">
          <div className="flex justify-between mb-2 text-xs">
            <span>Sous-total</span>
            <span>{formatAmount(subtotal)}</span>
          </div>
          <div className="flex justify-between mb-2 text-xs">
            <span>TVA</span>
            <span>{formatAmount(vatAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 mt-2 text-base font-bold">
            <span>Total</span>
            <span style={{ color: template.accentColor }}>
              {formatAmount(totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateMinimal;

