import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { InvoiceTemplateProps } from "./types";

const TemplateModern = ({
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
    : "Adresse de l'entreprise";

  // Construire l'adresse du client
  const clientAddress = client
    ? [client.addressLine1, client.city, client.country].filter(Boolean).join(", ")
    : "Adresse client (à définir)";

  return (
    <div
      className="max-w-[900px] mx-auto border border-slate-200 rounded-lg p-4 shadow-sm"
      style={{
        backgroundColor: template.backgroundColor || "#ffffff",
        color: template.textColor || "#1F1B2E",
      }}
    >
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:justify-between">
        {/* Header Left */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: template.accentColor }}>
              Facturly — Template {template.name || "Moderne"}
            </p>
            <p className="text-sm font-medium">{workspace?.name || "Nom de l'entreprise"}</p>
            <p className="text-xs opacity-70">{workspaceAddress}</p>
          </div>
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: template.accentColor }}>
              Destinataire
            </p>
            <p className="text-sm">{metadata.receiver || client?.name || "Nom client"}</p>
            <p className="text-xs opacity-70">{clientAddress}</p>
          </div>
        </div>

        {/* Header Right */}
        <div className="flex flex-col gap-3 text-left md:text-right md:items-end">
          <p className="text-xs font-semibold uppercase opacity-70 mb-1">Informations</p>
          <p className="text-sm">Objet : {metadata.subject || "Projet"}</p>
          <p className="text-sm">Émise le : {formatDate(metadata.issueDate)}</p>
          <p className="text-sm">Échéance : {formatDate(metadata.dueDate)}</p>
        </div>
      </div>

      {/* Separator */}
      <Separator
        className="my-6"
        style={{ backgroundColor: template.accentColor, opacity: 0.3 }}
      />

      {/* Table Container */}
      <div className="my-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wide text-slate-500">
                Description
              </TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide text-slate-500">
                Quantité
              </TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide text-slate-500">
                P.U.
              </TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide text-slate-500">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length ? (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm font-medium">{item.description}</TableCell>
                  <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                  <TableCell className="text-right text-sm">{formatAmount(item.unitPrice)}</TableCell>
                  <TableCell className="text-right text-sm font-semibold">
                    {formatAmount(item.unitPrice * item.quantity)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                  Ajoutez des lignes pour prévisualiser le rendu de votre facture.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right text-xs uppercase opacity-70">
                Sous-total
              </TableCell>
              <TableCell className="text-right text-sm font-semibold">{formatAmount(subtotal)}</TableCell>
            </TableRow>
            {vatAmount > 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-right text-xs uppercase opacity-70">
                  TVA estimée
                </TableCell>
                <TableCell className="text-right text-sm font-semibold">{formatAmount(vatAmount)}</TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={3} className="text-right text-xs uppercase opacity-70">
                Total TTC
              </TableCell>
              <TableCell
                className="text-right text-lg font-bold"
                style={{ color: template.accentColor }}
              >
                {formatAmount(totalAmount)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Footer Section */}
      <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 text-xs sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="font-semibold" style={{ color: template.accentColor }}>
            Conditions de paiement
          </p>
          <p>Virement bancaire sous 15 jours. Merci de préciser le numéro de facture.</p>
          {metadata.notes && (
            <p className="mt-2">Note interne : {metadata.notes}</p>
          )}
        </div>
        <div className="text-left sm:text-left">
          <p className="font-semibold" style={{ color: template.accentColor }}>
            Signature
          </p>
          <p>{workspace?.name || "Entreprise"}</p>
        </div>
      </div>
    </div>
  );
};

export default TemplateModern;

