import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceTemplateProps } from "./types";

const TemplateColorful = ({
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
    : "";

  // Construire l'adresse du client
  const clientAddress = client
    ? [client.city, client.country].filter(Boolean).join(", ")
    : "";

  return (
    <div className="max-w-[850px] mx-auto bg-white rounded-[20px] overflow-hidden shadow-2xl">
      {/* Colorful Header */}
      <div
        className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white p-10 text-center"
        style={{
          background: template.accentColor
            ? `linear-gradient(135deg, ${template.accentColor}, ${template.accentColor}dd)`
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <h1 className="text-5xl font-bold mb-2.5 drop-shadow-md">FACTURE</h1>
        <p className="text-base opacity-90 tracking-wide">N° {metadata.subject || "N/A"}</p>
      </div>

      <div className="p-10">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Entreprise Card */}
          <div className="bg-gradient-to-br from-[#f093fb] to-[#f5576c] rounded-[15px] p-5 text-white">
            <h3 className="text-xs uppercase tracking-wide mb-3 opacity-90">Entreprise</h3>
            <p className="mb-1 text-sm font-medium">{workspace?.name || "Nom de l'entreprise"}</p>
            {workspaceAddress && <p className="mb-1 text-sm font-medium">{workspaceAddress}</p>}
          </div>

          {/* Client Card */}
          <div className="bg-gradient-to-br from-[#4facfe] to-[#00f2fe] rounded-[15px] p-5 text-white">
            <h3 className="text-xs uppercase tracking-wide mb-3 opacity-90">Client</h3>
            <p className="mb-1 text-sm font-medium">
              {metadata.receiver || client?.name || "Nom client"}
            </p>
            {clientAddress && <p className="mb-1 text-sm font-medium">{clientAddress}</p>}
            <p className="mt-2 text-[11px] font-medium">
              Émise: {formatDate(metadata.issueDate)}
              <br />
              Échéance: {formatDate(metadata.dueDate)}
            </p>
          </div>
        </div>

        {/* Items Section */}
        <div className="my-8">
          <Table className="rounded-lg overflow-hidden shadow-md">
            <TableHeader>
              <TableRow
                className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white hover:bg-gradient-to-br hover:from-[#667eea] hover:to-[#764ba2]"
                style={{
                  background: template.accentColor
                    ? `linear-gradient(135deg, ${template.accentColor}, ${template.accentColor}dd)`
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <TableHead className="py-4 px-3 text-left font-semibold text-xs uppercase tracking-wide text-white">
                  Description
                </TableHead>
                <TableHead className="py-4 px-3 text-right font-semibold text-xs uppercase tracking-wide text-white">
                  Quantité
                </TableHead>
                <TableHead className="py-4 px-3 text-right font-semibold text-xs uppercase tracking-wide text-white">
                  Prix unitaire
                </TableHead>
                <TableHead className="py-4 px-3 text-right font-semibold text-xs uppercase tracking-wide text-white">
                  TVA
                </TableHead>
                <TableHead className="py-4 px-3 text-right font-semibold text-xs uppercase tracking-wide text-white">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length ? (
                items.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className={`border-b border-slate-200 ${index % 2 === 1 ? "bg-[#f7fafc]" : ""} hover:bg-[#edf2f7]`}
                  >
                    <TableCell className="py-3 px-3">{item.description}</TableCell>
                    <TableCell className="py-3 px-3 text-right">{item.quantity}</TableCell>
                    <TableCell className="py-3 px-3 text-right">
                      {formatAmount(item.unitPrice)}
                    </TableCell>
                    <TableCell className="py-3 px-3 text-right">{item.vatRate}%</TableCell>
                    <TableCell className="py-3 px-3 text-right font-semibold">
                      {formatAmount(item.unitPrice * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-[#a0aec0] text-sm"
                  >
                    Aucune ligne de facture
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Totals Card */}
        <div
          className="bg-gradient-to-br from-[#fa709a] to-[#fee140] rounded-[15px] p-6 mt-8 text-white"
          style={{
            background: template.accentColor
              ? `linear-gradient(135deg, ${template.accentColor}cc, ${template.accentColor}99)`
              : "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
          }}
        >
          <div className="flex justify-between py-2 text-sm">
            <span>Sous-total HT</span>
            <span>{formatAmount(subtotal)}</span>
          </div>
          <div className="flex justify-between py-2 text-sm">
            <span>TVA</span>
            <span>{formatAmount(vatAmount)}</span>
          </div>
          <div className="flex justify-between pt-4 mt-3 border-t-2 border-white/30 text-2xl font-bold">
            <span>TOTAL TTC</span>
            <span>{formatAmount(totalAmount)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-5 border-t-2 border-dashed border-slate-300 text-center text-xs text-[#718096]">
          <p>Merci pour votre confiance !</p>
          {workspace?.name && <p className="mt-1">{workspace.name}</p>}
        </div>
      </div>
    </div>
  );
};

export default TemplateColorful;

