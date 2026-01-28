import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceTemplateProps } from "./types";

const TemplateClassicSerif = ({
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
  return (
    <div
      className="max-w-[800px] mx-auto"
      style={{
        fontFamily: "'Times New Roman', serif",
        color: "#000000",
      }}
    >
      {/* Header */}
      <div className="flex justify-between mb-10 pb-5 border-b-[3px] border-black">
        <div>
          <h1 className="text-4xl font-bold mb-1 tracking-wide">FACTURE</h1>
          <p className="text-sm font-normal text-[#666666]">N° {metadata.subject || "N/A"}</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg mb-2.5">{workspace?.name || "Nom de l'entreprise"}</h2>
          {workspace?.addressLine1 && <p className="text-[11px] mb-0.5">{workspace.addressLine1}</p>}
          {workspace?.postalCode && workspace?.city && (
            <p className="text-[11px] mb-0.5">
              {workspace.postalCode} {workspace.city}
            </p>
          )}
          {workspace?.country && <p className="text-[11px] mb-0.5">{workspace.country}</p>}
        </div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Facturé à */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide mb-2.5 text-[#666666]">
            Facturé à
          </div>
          <div className="space-y-1 text-xs">
            <p>
              <strong>{metadata.receiver || client?.name || "Nom client"}</strong>
            </p>
            {client?.addressLine1 && <p>{client.addressLine1}</p>}
            {client?.postalCode && client?.city && (
              <p>
                {client.postalCode} {client.city}
              </p>
            )}
            {client?.country && <p>{client.country}</p>}
          </div>
        </div>

        {/* Détails */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide mb-2.5 text-[#666666]">
            Détails
          </div>
          <div className="space-y-1 text-xs">
            <p>
              <strong>Date d'émission:</strong> {formatDate(metadata.issueDate)}
            </p>
            <p>
              <strong>Date d'échéance:</strong> {formatDate(metadata.dueDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <Table className="mb-8">
        <TableHeader>
          <TableRow className="border-t-2 border-b-2 border-black hover:bg-transparent">
            <TableHead className="py-3 px-2 text-left font-bold text-[11px] uppercase">
              Description
            </TableHead>
            <TableHead className="py-3 px-2 text-center font-bold text-[11px] uppercase">
              Qté
            </TableHead>
            <TableHead className="py-3 px-2 text-right font-bold text-[11px] uppercase">
              Prix unitaire
            </TableHead>
            <TableHead className="py-3 px-2 text-right font-bold text-[11px] uppercase">
              TVA
            </TableHead>
            <TableHead className="py-3 px-2 text-right font-bold text-[11px] uppercase">
              Total
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length ? (
            items.map((item) => (
              <TableRow key={item.id} className="border-b border-[#e0e0e0] last:border-b-2 last:border-black">
                <TableCell className="py-2.5 px-2 text-xs">{item.description}</TableCell>
                <TableCell className="py-2.5 px-2 text-center text-xs">{item.quantity}</TableCell>
                <TableCell className="py-2.5 px-2 text-right text-xs">
                  {formatAmount(item.unitPrice)}
                </TableCell>
                <TableCell className="py-2.5 px-2 text-right text-xs">{item.vatRate}%</TableCell>
                <TableCell className="py-2.5 px-2 text-right text-xs font-bold">
                  {formatAmount(item.unitPrice * item.quantity)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-xs py-5">
                Aucune ligne ajoutée
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Totals Section */}
      <div className="flex justify-end mb-10">
        <table className="w-[300px]">
          <tbody>
            <tr className="border-b border-[#e0e0e0]">
              <td className="py-2 px-3 text-xs text-right font-bold">Sous-total HT</td>
              <td className="py-2 px-3 text-xs text-right font-bold">{formatAmount(subtotal)}</td>
            </tr>
            <tr className="border-b border-[#e0e0e0]">
              <td className="py-2 px-3 text-xs text-right font-bold">TVA</td>
              <td className="py-2 px-3 text-xs text-right font-bold">{formatAmount(vatAmount)}</td>
            </tr>
            <tr className="border-t-2 border-b-2 border-black text-base font-bold">
              <td className="py-3 px-3 text-right">TOTAL TTC</td>
              <td className="py-3 px-3 text-right">{formatAmount(totalAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notes Section */}
      {metadata.notes && (
        <div className="mt-8 p-4 bg-[#f9f9f9] border-l-4 border-black">
          <h3 className="text-xs font-bold mb-2">Notes</h3>
          <p className="text-[11px] whitespace-pre-wrap">{metadata.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-5 border-t border-[#e0e0e0] text-[11px] text-[#666666]">
        <p className="mb-1">Merci pour votre confiance !</p>
        <p>{workspace?.name || "Entreprise"}</p>
      </div>
    </div>
  );
};

export default TemplateClassicSerif;

