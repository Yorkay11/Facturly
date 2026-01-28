import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceTemplateProps } from "./types";

const TemplateInvoice = ({
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
    ? [client.addressLine1, client.city, client.country].filter(Boolean).join(", ")
    : "";

  return (
    <div className="grid overflow-hidden rounded-xl border border-slate-200 shadow-sm md:grid-cols-[220px_1fr] bg-white">
      {/* LEFT PANEL - Sidebar */}
      <div
        className="flex flex-col gap-4 p-4 text-white"
        style={{
          backgroundColor: template.accentColor,
        }}
      >
        <div>
          <div className="text-xs uppercase opacity-80 font-bold mb-1">Facturly</div>
          <h1 className="text-base font-bold m-0">{template.name || "Facture"}</h1>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs uppercase opacity-80 font-bold mb-1">Entreprise</div>
            <p className="text-xs m-0.5">{workspace?.name || "Nom de l'entreprise"}</p>
            {workspaceAddress && <p className="text-xs m-0.5">{workspaceAddress}</p>}
          </div>

          <div>
            <div className="text-xs uppercase opacity-80 font-bold mb-1">Destinataire</div>
            <p className="text-xs m-0.5">{metadata.receiver || client?.name || "Nom client"}</p>
            {clientAddress && <p className="text-xs m-0.5">{clientAddress}</p>}
          </div>

          <div>
            <div className="text-xs uppercase opacity-80 font-bold mb-1">Objet</div>
            <p className="text-xs m-0.5">{metadata.subject || "Projet"}</p>
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <div className="text-xs uppercase opacity-80 font-bold">Notes</div>
          <p className="text-xs m-0">{metadata.notes || "Aucune note interne"}</p>
        </div>
      </div>

      {/* RIGHT PANEL - Content */}
      <div
        className="space-y-6 p-4 bg-white"
        style={{ color: template.textColor || "#1F1B2E" }}
      >
        {/* Header Row */}
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <strong>Facture générée</strong>
          <div className="text-xs opacity-70 flex flex-wrap gap-2">
            <span>Émise le : {formatDate(metadata.issueDate)}</span>
            <span>|</span>
            <span>Échéance : {formatDate(metadata.dueDate)}</span>
          </div>
        </div>

        {/* Workspace Info Box */}
        {workspace && (
          <div className="border border-slate-200 rounded-lg p-3 text-xs">
            <h3 className="m-0 mb-1.5 text-xs font-semibold" style={{ color: template.accentColor }}>
              Informations entreprise
            </h3>
            {workspace.legalName && <p className="m-0">Raison sociale : {workspace.legalName}</p>}
          </div>
        )}

        {/* Items Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">#</TableHead>
              <TableHead className="text-xs">Description</TableHead>
              <TableHead className="text-right text-xs">Quantité</TableHead>
              <TableHead className="text-right text-xs">PU</TableHead>
              <TableHead className="text-right text-xs">TVA</TableHead>
              <TableHead className="text-right text-xs">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length ? (
              items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs font-medium">{index + 1}</TableCell>
                  <TableCell className="text-xs font-medium">{item.description}</TableCell>
                  <TableCell className="text-right text-xs">{item.quantity}</TableCell>
                  <TableCell className="text-right text-xs">{formatAmount(item.unitPrice)}</TableCell>
                  <TableCell className="text-right text-xs">{item.vatRate}%</TableCell>
                  <TableCell className="text-right text-xs font-semibold">
                    {formatAmount(item.unitPrice * item.quantity)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-right text-xs opacity-70 py-10">
                  Aucune ligne ajoutée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="text-right text-xs opacity-70">
                Sous-total
              </TableCell>
              <TableCell className="text-right text-xs font-semibold">{formatAmount(subtotal)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={5} className="text-right text-xs opacity-70">
                TVA estimée
              </TableCell>
              <TableCell className="text-right text-xs font-semibold">{formatAmount(vatAmount)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={5} className="text-right text-xs opacity-70">
                Total TTC
              </TableCell>
              <TableCell className="text-right text-lg font-bold" style={{ color: template.accentColor }}>
                {formatAmount(totalAmount)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {/* Footer */}
        <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 text-xs sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h4 className="m-0 mb-1 text-xs font-semibold" style={{ color: template.accentColor }}>
              Rappel
            </h4>
            <p className="m-0">Merci de régler la facture avant l'échéance indiquée. Retard = pénalités 10%.</p>
          </div>
          <div>
            <h4 className="m-0 mb-1 text-xs font-semibold" style={{ color: template.accentColor }}>
              Signature
            </h4>
            <p className="m-0">{workspace?.name || "Entreprise"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateInvoice;

