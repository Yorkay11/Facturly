import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { InvoiceTemplateProps } from "./types";

const TemplateClassic = ({
  metadata,
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
      className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      style={{
        backgroundColor: template.backgroundColor || "#fff",
        color: template.textColor || "#1F1B2E",
      }}
    >
      <div className="flex flex-col gap-6 md:flex-row md:justify-between">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold" style={{ color: template.accentColor }}>
              Facturly — Template {template.name}
            </p>
            <p className="text-sm">DevOne Consulting</p>
            <p className="text-xs opacity-70">Totsi, Lomé - Togo</p>
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: template.accentColor }}>
              Destinataire
            </p>
            <p className="text-sm">{metadata.receiver || "Nom client"}</p>
            <p className="text-xs opacity-70">Adresse client (à définir)</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 text-right">
          <p className="text-xs font-semibold uppercase opacity-70">Informations</p>
          <p className="text-sm">Objet : {metadata.subject || "Projet"}</p>
          <p className="text-sm">Émise le : {formatDate(metadata.issueDate)}</p>
          <p className="text-sm">Échéance : {formatDate(metadata.dueDate)}</p>
        </div>
      </div>

      <Separator style={{ backgroundColor: template.accentColor, opacity: 0.3 }} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Quantité</TableHead>
            <TableHead className="text-right">P.U.</TableHead>
            <TableHead className="text-right">TVA</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length ? (
            items.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="text-sm font-medium">{invoice.description}</TableCell>
                <TableCell className="text-right text-sm">{invoice.quantity}</TableCell>
                <TableCell className="text-right text-sm">{formatAmount(invoice.unitPrice)}</TableCell>
                <TableCell className="text-right text-sm">{invoice.vatRate}%</TableCell>
                <TableCell className="text-right text-sm font-semibold">{formatAmount(invoice.unitPrice * invoice.quantity)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-sm">
                Ajoutez des lignes pour prévisualiser le rendu de votre facture.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="text-right text-xs uppercase opacity-70">
              Sous-total
            </TableCell>
            <TableCell className="text-right text-sm font-semibold">{formatAmount(subtotal)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={4} className="text-right text-xs uppercase opacity-70">
              TVA estimée
            </TableCell>
            <TableCell className="text-right text-sm font-semibold">{formatAmount(vatAmount)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={4} className="text-right text-xs uppercase opacity-70">
              Total TTC
            </TableCell>
            <TableCell className="text-right text-lg font-bold" style={{ color: template.accentColor }}>
              {formatAmount(totalAmount)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 text-xs sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="font-semibold" style={{ color: template.accentColor }}>
            Conditions de paiement
          </p>
          <p>Virement bancaire sous 15 jours. Merci de préciser le numéro de facture.</p>
          {metadata.notes ? <p className="mt-2">Note interne : {metadata.notes}</p> : null}
        </div>
        <div className="text-right sm:text-left">
          <p className="font-semibold" style={{ color: template.accentColor }}>
            Signature
          </p>
          <p>York Wona (mock)
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplateClassic;
