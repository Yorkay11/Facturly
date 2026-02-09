"use client";

import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import Breadcrumb from "@/components/ui/breadcrumb";
import { useTranslations } from "next-intl";
import { useGetRecurringInvoiceByIdQuery, useGenerateRecurringInvoiceMutation } from "@/services/facturlyApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Repeat, Mail, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RecurringInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("recurringInvoices.detail");
  const locale = useTranslations("common").raw("locale") || "fr";
  const dateLocale = locale === "fr" ? fr : enUS;

  const id = params.id as string;
  const { data: recurringInvoice, isLoading } = useGetRecurringInvoiceByIdQuery(id);
  const [generateInvoice, { isLoading: isGenerating }] = useGenerateRecurringInvoiceMutation();

  const handleGenerate = async () => {
    try {
      const invoice = await generateInvoice(id).unwrap();
      toast.success(t("generateSuccess"));
      router.push(`/invoices/${invoice.id}`);
    } catch (error: any) {
      toast.error(error?.data?.message || t("generateError"));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!recurringInvoice) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-destructive">{t("notFound")}</p>
      </div>
    );
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "monthly":
        return t("frequency.monthly");
      case "quarterly":
        return t("frequency.quarterly");
      case "yearly":
        return t("frequency.yearly");
      default:
        return frequency;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500">{t("status.active")}</Badge>;
      case "paused":
        return <Badge variant="secondary">{t("status.paused")}</Badge>;
      case "completed":
        return <Badge variant="outline">{t("status.completed")}</Badge>;
      case "cancelled":
        return <Badge variant="destructive">{t("status.cancelled")}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb
        items={[
          { label: t("breadcrumb.dashboard"), href: "/dashboard" },
          { label: t("breadcrumb.recurringInvoices"), href: "/recurring-invoices" },
          { label: recurringInvoice.name || t("unnamed") },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Informations principales */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{recurringInvoice.name || t("unnamed")}</CardTitle>
                <CardDescription>{t("details")}</CardDescription>
              </div>
              {getStatusBadge(recurringInvoice.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t("client")}</p>
                <p className="font-medium">{recurringInvoice.client.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("frequency")}</p>
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{getFrequencyLabel(recurringInvoice.frequency)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("startDate")}</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {format(new Date(recurringInvoice.startDate), "PP", { locale: dateLocale })}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("nextGeneration")}</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {format(new Date(recurringInvoice.nextGenerationDate), "PP", { locale: dateLocale })}
                  </p>
                </div>
              </div>
              {recurringInvoice.endDate && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("endDate")}</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      {format(new Date(recurringInvoice.endDate), "PP", { locale: dateLocale })}
                    </p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">{t("dayOfMonth")}</p>
                <p className="font-medium">{recurringInvoice.dayOfMonth}</p>
              </div>
            </div>

            {recurringInvoice.autoSend && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("autoSend")}</p>
                  {recurringInvoice.recipientEmail && (
                    <p className="text-sm text-muted-foreground">{recurringInvoice.recipientEmail}</p>
                  )}
                </div>
              </div>
            )}

            {recurringInvoice.notificationDaysBefore > 0 && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">{t("notificationDaysBefore")}</p>
                <p className="font-medium">{recurringInvoice.notificationDaysBefore} {t("days")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("actions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={isGenerating || recurringInvoice.status !== "active"}
            >
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <FileText className="mr-2 h-4 w-4" />
              {t("generateNow")}
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/recurring-invoices/${id}/edit`}>{t("edit")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Articles */}
      {recurringInvoice.items && recurringInvoice.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("items")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.description")}</TableHead>
                  <TableHead className="text-right">{t("table.quantity")}</TableHead>
                  <TableHead className="text-right">{t("table.unitPrice")}</TableHead>
                  <TableHead className="text-right">{t("table.total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurringInvoice.items.map((item) => {
                  const quantity = parseFloat(item.quantity);
                  const unitPrice = parseFloat(item.unitPrice);
                  const total = quantity * unitPrice;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
                          style: "currency",
                          currency: recurringInvoice.currency,
                        }).format(unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
                          style: "currency",
                          currency: recurringInvoice.currency,
                        }).format(total)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Historique des factures générées */}
      {recurringInvoice.generatedInvoices && recurringInvoice.generatedInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("generatedInvoices")}</CardTitle>
            <CardDescription>
              {t("generatedCount", { count: recurringInvoice.totalInvoicesGenerated })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.number")}</TableHead>
                  <TableHead>{t("table.issueDate")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead className="text-right">{t("table.amount")}</TableHead>
                  <TableHead className="text-right">{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurringInvoice.generatedInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      <Link href={`/invoices/${invoice.id}`} className="hover:underline text-primary">
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.issueDate), "PP", { locale: dateLocale })}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
                        style: "currency",
                        currency: invoice.currency,
                      }).format(parseFloat(invoice.totalAmount))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/invoices/${invoice.id}`}>{t("view")}</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
