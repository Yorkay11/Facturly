import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceTemplateProps } from "./types";

const TemplateProfessional = ({
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
    <div className="max-w-[950px] mx-auto bg-white shadow-md">
      {/* Professional Header */}
      <div
        className="bg-[#2c3e50] text-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        style={{
          backgroundColor: template.accentColor || "#2c3e50",
        }}
      >
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase mb-2">FACTURE</h1>
          <p className="text-sm opacity-80 font-normal">
            Référence : {metadata.subject || "N/A"}
          </p>
        </div>
        <div className="text-right text-xs">
          <p className="mb-1 opacity-90">
            <strong>Date d'émission :</strong> {formatDate(metadata.issueDate)}
          </p>
          <p className="opacity-90">
            <strong>Date d'échéance :</strong> {formatDate(metadata.dueDate)}
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* Workspace & Client Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-8 border-b-2 border-[#ecf0f1]">
          {/* Émetteur */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#7f8c8d] mb-4 font-semibold">
              Émetteur
            </p>
            <div className="space-y-1">
              <p className="text-xs text-[#2c3e50]">
                <strong className="text-[13px] font-semibold">
                  {workspace?.name || "Nom de l'entreprise"}
                </strong>
              </p>
              {workspace?.legalName && <p className="text-xs text-[#2c3e50]">{workspace.legalName}</p>}
              {workspace?.addressLine1 && (
                <p className="text-xs text-[#2c3e50]">{workspace.addressLine1}</p>
              )}
              {workspace?.postalCode && workspace?.city && (
                <p className="text-xs text-[#2c3e50]">
                  {workspace.postalCode} {workspace.city}
                </p>
              )}
              {workspace?.country && <p className="text-xs text-[#2c3e50]">{workspace.country}</p>}
            </div>
          </div>

          {/* Destinataire */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#7f8c8d] mb-4 font-semibold">
              Destinataire
            </p>
            <div className="space-y-1">
              <p className="text-xs text-[#2c3e50]">
                <strong className="text-[13px] font-semibold">
                  {metadata.receiver || client?.name || "Nom client"}
                </strong>
              </p>
              {client?.addressLine1 && (
                <p className="text-xs text-[#2c3e50]">{client.addressLine1}</p>
              )}
              {client?.postalCode && client?.city && (
                <p className="text-xs text-[#2c3e50]">
                  {client.postalCode} {client.city}
                </p>
              )}
              {client?.country && <p className="text-xs text-[#2c3e50]">{client.country}</p>}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <Table className="my-8 text-xs">
          <TableHeader>
            <TableRow
              className="bg-[#34495e] text-white hover:bg-[#34495e]"
              style={{
                backgroundColor: template.accentColor || "#34495e",
              }}
            >
              <TableHead className="text-[10px] uppercase tracking-wide font-semibold text-white">
                Description
              </TableHead>
              <TableHead className="text-right text-[10px] uppercase tracking-wide font-semibold text-white">
                Quantité
              </TableHead>
              <TableHead className="text-right text-[10px] uppercase tracking-wide font-semibold text-white">
                Prix unitaire
              </TableHead>
              <TableHead className="text-right text-[10px] uppercase tracking-wide font-semibold text-white">
                TVA
              </TableHead>
              <TableHead className="text-right text-[10px] uppercase tracking-wide font-semibold text-white">
                Total HT
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length ? (
              items.map((item) => (
                <TableRow key={item.id} className="hover:bg-[#f8f9fa]">
                  <TableCell className="text-xs text-[#2c3e50]">{item.description}</TableCell>
                  <TableCell className="text-right text-xs text-[#2c3e50]">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right text-xs text-[#2c3e50]">
                    {formatAmount(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right text-xs text-[#2c3e50]">
                    {item.vatRate}%
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold text-[#2c3e50]">
                    {formatAmount(item.unitPrice * item.quantity)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-[#95a5a6] text-xs"
                >
                  Aucune ligne de facture
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Totals Section */}
        <div className="flex justify-end my-8">
          <table className="w-80 border border-[#ecf0f1]">
            <tbody>
              <tr className="border-b border-[#ecf0f1]">
                <td className="py-2.5 px-4 text-xs text-right text-[#7f8c8d] font-medium uppercase tracking-wide">
                  Sous-total HT
                </td>
                <td className="py-2.5 px-4 text-xs text-right font-semibold text-[#2c3e50]">
                  {formatAmount(subtotal)}
                </td>
              </tr>
              <tr className="border-b border-[#ecf0f1]">
                <td className="py-2.5 px-4 text-xs text-right text-[#7f8c8d] font-medium uppercase tracking-wide">
                  TVA
                </td>
                <td className="py-2.5 px-4 text-xs text-right font-semibold text-[#2c3e50]">
                  {formatAmount(vatAmount)}
                </td>
              </tr>
              <tr
                className="bg-[#2c3e50] text-white"
                style={{
                  backgroundColor: template.accentColor || "#2c3e50",
                }}
              >
                <td className="py-4 px-4 text-base font-semibold text-white uppercase tracking-wide">
                  Total TTC
                </td>
                <td className="py-4 px-4 text-base font-semibold text-white text-right">
                  {formatAmount(totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes Section */}
        {metadata.notes && (
          <div className="mt-8 p-5 bg-[#f8f9fa] border-l-4 border-[#34495e] text-xs">
            <h3
              className="text-xs uppercase tracking-wide mb-2 font-semibold"
              style={{
                color: template.accentColor || "#34495e",
              }}
            >
              Notes
            </h3>
            <p className="text-[#2c3e50]">{metadata.notes}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-[#ecf0f1] px-10 py-5 text-center text-[10px] text-[#7f8c8d] border-t border-[#bdc3c7]">
        <p>{workspace?.name || "Entreprise"} - Tous droits réservés</p>
      </div>
    </div>
  );
};

export default TemplateProfessional;

