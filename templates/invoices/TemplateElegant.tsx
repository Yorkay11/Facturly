import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceTemplateProps } from "./types";

const TemplateElegant = ({
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
      className="max-w-[900px] mx-auto bg-white shadow-lg p-16 border border-[#e8e8e8]"
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: "#2c3e50",
      }}
    >
      {/* Elegant Header */}
      <div className="text-center mb-16 pb-8 border-b-[3px] border-double border-[#d4af37]">
        <h1 className="text-[42px] font-normal tracking-widest text-[#2c3e50] mb-2.5 italic">
          FACTURE
        </h1>
        <p className="text-sm text-[#7f8c8d] tracking-wider font-light">
          N° {metadata.subject || "N/A"}
        </p>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        {/* De */}
        <div>
          <h3 className="text-[11px] uppercase tracking-wide text-[#95a5a6] mb-4 font-semibold border-b border-[#ecf0f1] pb-2">
            De
          </h3>
          <div className="space-y-1.5 text-[13px] leading-relaxed">
            <p>
              <strong className="font-semibold text-[#2c3e50]">
                {workspace?.name || "Nom de l'entreprise"}
              </strong>
            </p>
            {workspace?.addressLine1 && <p>{workspace.addressLine1}</p>}
            {workspace?.postalCode && workspace?.city && (
              <p>
                {workspace.postalCode} {workspace.city}
              </p>
            )}
            {workspace?.country && <p>{workspace.country}</p>}
            {workspace?.vatNumber && <p>TVA : {workspace.vatNumber}</p>}
          </div>
        </div>

        {/* À */}
        <div>
          <h3 className="text-[11px] uppercase tracking-wide text-[#95a5a6] mb-4 font-semibold border-b border-[#ecf0f1] pb-2">
            À
          </h3>
          <div className="space-y-1.5 text-[13px] leading-relaxed">
            <p>
              <strong className="font-semibold text-[#2c3e50]">
                {metadata.receiver || client?.name || "Nom client"}
              </strong>
            </p>
            {client?.addressLine1 && <p>{client.addressLine1}</p>}
            {client?.postalCode && client?.city && (
              <p>
                {client.postalCode} {client.city}
              </p>
            )}
            {client?.country && <p>{client.country}</p>}
            <p className="mt-4">
              <strong className="font-semibold text-[#2c3e50]">Date d'émission :</strong>{" "}
              {formatDate(metadata.issueDate)}
              <br />
              <strong className="font-semibold text-[#2c3e50]">Date d'échéance :</strong>{" "}
              {formatDate(metadata.dueDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <Table className="my-10 text-[13px]">
        <TableHeader>
          <TableRow className="bg-gradient-to-b from-[#f8f9fa] to-[#ecf0f1] hover:bg-gradient-to-b hover:from-[#f8f9fa] hover:to-[#ecf0f1]">
            <TableHead className="py-4 px-3 text-left font-semibold text-[11px] uppercase tracking-wide text-[#34495e] border-b-2 border-[#bdc3c7]">
              Description
            </TableHead>
            <TableHead className="py-4 px-3 text-right font-semibold text-[11px] uppercase tracking-wide text-[#34495e] border-b-2 border-[#bdc3c7]">
              Quantité
            </TableHead>
            <TableHead className="py-4 px-3 text-right font-semibold text-[11px] uppercase tracking-wide text-[#34495e] border-b-2 border-[#bdc3c7]">
              Prix unitaire
            </TableHead>
            <TableHead className="py-4 px-3 text-right font-semibold text-[11px] uppercase tracking-wide text-[#34495e] border-b-2 border-[#bdc3c7]">
              TVA
            </TableHead>
            <TableHead className="py-4 px-3 text-right font-semibold text-[11px] uppercase tracking-wide text-[#34495e] border-b-2 border-[#bdc3c7]">
              Total
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length ? (
            items.map((item) => (
              <TableRow key={item.id} className="hover:bg-[#f8f9fa] border-b border-[#ecf0f1] last:border-b-2 last:border-[#bdc3c7]">
                <TableCell className="py-3.5 px-3">{item.description}</TableCell>
                <TableCell className="py-3.5 px-3 text-right">{item.quantity}</TableCell>
                <TableCell className="py-3.5 px-3 text-right">
                  {formatAmount(item.unitPrice)}
                </TableCell>
                <TableCell className="py-3.5 px-3 text-right">{item.vatRate}%</TableCell>
                <TableCell className="py-3.5 px-3 text-right font-semibold">
                  {formatAmount(item.unitPrice * item.quantity)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-[#95a5a6] text-[13px]"
              >
                Aucune ligne de facture
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Totals Section */}
      <div className="flex justify-end my-10">
        <table className="w-[350px] border-2 border-[#d4af37]">
          <tbody>
            <tr className="border-b border-[#ecf0f1]">
              <td className="py-3 px-4 text-[13px] text-right text-[#7f8c8d] font-medium">
                Sous-total HT
              </td>
              <td className="py-3 px-4 text-[13px] text-right font-semibold">{formatAmount(subtotal)}</td>
            </tr>
            <tr className="border-b border-[#ecf0f1]">
              <td className="py-3 px-4 text-[13px] text-right text-[#7f8c8d] font-medium">TVA</td>
              <td className="py-3 px-4 text-[13px] text-right font-semibold">{formatAmount(vatAmount)}</td>
            </tr>
            <tr
              className="bg-gradient-to-b from-[#d4af37] to-[#b8941f] text-white"
              style={{
                background: template.accentColor
                  ? `linear-gradient(to bottom, ${template.accentColor}, ${template.accentColor}dd)`
                  : "linear-gradient(to bottom, #d4af37, #b8941f)",
              }}
            >
              <td className="py-4.5 px-4 text-lg font-bold text-white">TOTAL TTC</td>
              <td className="py-4.5 px-4 text-lg font-bold text-white text-right">
                {formatAmount(totalAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-[#ecf0f1] text-center text-[11px] text-[#95a5a6] italic">
        <p>Nous vous remercions de votre confiance</p>
        {workspace?.name && <p className="mt-1">{workspace.name}</p>}
      </div>
    </div>
  );
};

export default TemplateElegant;

