import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceTemplateProps } from "./types";

const TemplateCompact = ({
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
      className="max-w-[700px] mx-auto"
      style={{
        fontFamily: "'Courier New', monospace",
        color: "#000000",
      }}
    >
      {/* Compact Header */}
      <div className="flex justify-between mb-5 pb-2.5 border-b-2 border-black">
        <div>
          <h1 className="text-lg font-bold uppercase mb-0">FACTURE</h1>
          <p className="text-[9px]">N° {metadata.subject || "N/A"}</p>
        </div>
        <div className="text-right text-[9px]">
          <p>Émise: {formatDate(metadata.issueDate)}</p>
          <p>Échéance: {formatDate(metadata.dueDate)}</p>
        </div>
      </div>

      {/* Compact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 text-[9px]">
        <div>
          <p className="font-bold mb-1 uppercase">Entreprise</p>
          <p className="mb-0.5">{workspace?.name || "-"}</p>
          <p className="mb-0.5">{workspaceAddress}</p>
          {workspace?.vatNumber && <p>TVA: {workspace.vatNumber}</p>}
        </div>
        <div>
          <p className="font-bold mb-1 uppercase">Client</p>
          <p className="mb-0.5">{metadata.receiver || client?.name || "-"}</p>
          <p>{clientAddress}</p>
        </div>
      </div>

      {/* Items Table */}
      <Table className="my-4 text-[9px] border-collapse">
        <TableHeader>
          <TableRow className="bg-black text-white hover:bg-black border border-black">
            <TableHead className="py-1 px-1.5 text-left font-bold text-[8px] uppercase border border-black text-white">
              Description
            </TableHead>
            <TableHead className="py-1 px-1.5 text-right font-bold text-[8px] uppercase border border-black text-white">
              Qté
            </TableHead>
            <TableHead className="py-1 px-1.5 text-right font-bold text-[8px] uppercase border border-black text-white">
              PU
            </TableHead>
            <TableHead className="py-1 px-1.5 text-right font-bold text-[8px] uppercase border border-black text-white">
              TVA
            </TableHead>
            <TableHead className="py-1 px-1.5 text-right font-bold text-[8px] uppercase border border-black text-white">
              Total
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length ? (
            items.map((item, index) => (
              <TableRow
                key={item.id}
                className={`border border-black ${index % 2 === 1 ? "bg-[#f5f5f5]" : ""}`}
              >
                <TableCell className="py-1 px-1.5 border border-black">{item.description}</TableCell>
                <TableCell className="py-1 px-1.5 text-right border border-black">
                  {item.quantity}
                </TableCell>
                <TableCell className="py-1 px-1.5 text-right border border-black">
                  {formatAmount(item.unitPrice)}
                </TableCell>
                <TableCell className="py-1 px-1.5 text-right border border-black">
                  {item.vatRate}%
                </TableCell>
                <TableCell className="py-1 px-1.5 text-right border border-black">
                  {formatAmount(item.unitPrice * item.quantity)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-2.5 text-[9px] border border-black">
                Aucune ligne
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Compact Totals */}
      <div className="mt-4 ml-auto w-[250px] text-[9px]">
        <div className="flex justify-between py-0.5 border-b border-black">
          <span>Sous-total HT</span>
          <span>{formatAmount(subtotal)}</span>
        </div>
        <div className="flex justify-between py-0.5 border-b border-black">
          <span>TVA</span>
          <span>{formatAmount(vatAmount)}</span>
        </div>
        <div className="flex justify-between py-1.5 border-t-2 border-b-2 border-black font-bold text-[11px] mt-1">
          <span>TOTAL TTC</span>
          <span>{formatAmount(totalAmount)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-2.5 border-t border-black text-[8px] text-center">
        <p>{workspace?.name || "Entreprise"}</p>
      </div>
    </div>
  );
};

export default TemplateCompact;

