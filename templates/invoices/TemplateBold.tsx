import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceTemplateProps } from "./types";

const TemplateBold = ({
  metadata,
  company,
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
  const companyAddress = company
    ? [company.city, company.country].filter(Boolean).join(", ")
    : "";

  // Construire l'adresse du client
  const clientAddress = client
    ? [client.addressLine1, client.city, client.country].filter(Boolean).join(", ")
    : "Adresse à compléter";
  return (
    <div className="grid overflow-hidden rounded-xl border border-slate-200 shadow-sm md:grid-cols-[220px_1fr]">
      <div
        className="flex flex-col gap-6 p-6 text-white"
        style={{
          backgroundColor: template.accentColor,
        }}
      >
        <div>
          <p className="text-xs uppercase opacity-80">Facturly</p>
          <p className="text-lg font-semibold">{template.name}</p>
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <p className="font-semibold uppercase">Entreprise</p>
            <p>{company?.name || "Nom de l'entreprise"}</p>
            <p className="opacity-80">{companyAddress || "Adresse de l'entreprise"}</p>
          </div>
          <div>
            <p className="font-semibold uppercase">Destinataire</p>
            <p>{metadata.receiver || client?.name || "Nom client"}</p>
            <p className="opacity-80">{clientAddress}</p>
          </div>
          <div>
            <p className="font-semibold uppercase">Objet</p>
            <p>{metadata.subject || "Projet"}</p>
          </div>
        </div>
        <div className="mt-auto space-y-2 text-xs">
          <p className="font-semibold uppercase">Notes</p>
          <p>{metadata.notes || "Aucune note interne"}</p>
        </div>
      </div>
      <div className="space-y-6 bg-white p-6" style={{ color: template.textColor || "#1F1B2E" }}>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold">Facture générée</span>
            <div className="flex flex-wrap gap-4 text-xs opacity-70">
              <span>Émise le : {formatDate(metadata.issueDate)}</span>
              <span>Échéance : {formatDate(metadata.dueDate)}</span>
            </div>
          </div>
          {company && (
            <div className="rounded-lg border border-slate-200 p-3 text-xs">
              <p className="font-semibold" style={{ color: template.accentColor }}>
                Informations entreprise
              </p>
              {company.legalName && <p>Raison sociale : {company.legalName}</p>}
              {company.taxId && <p>SIRET : {company.taxId}</p>}
              {company.vatNumber && <p>TVA : {company.vatNumber}</p>}
            </div>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Quantité</TableHead>
              <TableHead className="text-right">PU</TableHead>
              <TableHead className="text-right">TVA</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length ? (
              items.map((invoice, index) => (
                <TableRow key={invoice.id}>
                  <TableCell className="text-xs font-medium">{index + 1}</TableCell>
                  <TableCell className="text-sm font-medium">{invoice.description}</TableCell>
                  <TableCell className="text-right text-sm">{invoice.quantity}</TableCell>
                  <TableCell className="text-right text-sm">{formatAmount(invoice.unitPrice)}</TableCell>
                  <TableCell className="text-right text-sm">{invoice.vatRate}%</TableCell>
                  <TableCell className="text-right text-sm font-semibold">{formatAmount(invoice.unitPrice * invoice.quantity)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm">
                  Ajoutez des lignes pour prévisualiser le rendu de votre facture.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="text-right text-xs uppercase opacity-70">
                Sous-total
              </TableCell>
              <TableCell className="text-right text-sm font-semibold">{formatAmount(subtotal)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={5} className="text-right text-xs uppercase opacity-70">
                TVA estimée
              </TableCell>
              <TableCell className="text-right text-sm font-semibold">{formatAmount(vatAmount)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={5} className="text-right text-xs uppercase opacity-70">
                Total TTC
              </TableCell>
              <TableCell className="text-right text-xl font-bold" style={{ color: template.accentColor }}>
                {formatAmount(totalAmount)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 text-xs sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="font-semibold" style={{ color: template.accentColor }}>
              Rappel
            </p>
            <p>Merci de régler la facture avant l'échéance indiquée. Retard = pénalités 10%.</p>
          </div>
          <div className="text-right sm:text-left">
            <p className="font-semibold" style={{ color: template.accentColor }}>
              Signature
            </p>
            <p>{company?.name || "Entreprise"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateBold;
