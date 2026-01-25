"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { format, addMonths, addQuarters, addYears } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetClientsQuery,
  useGetProductsQuery,
  useCreateRecurringInvoiceMutation,
  useUpdateRecurringInvoiceMutation,
  useGetRecurringInvoiceByIdQuery,
} from "@/services/facturlyApi";
import { toast } from "sonner";
import ClientModal from "@/components/modals/ClientModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const recurringInvoiceSchema = z.object({
  clientId: z.string().min(1, "Client requis"),
  name: z.string().optional(),
  frequency: z.enum(["monthly", "quarterly", "yearly"]),
  startDate: z.date(),
  endDate: z.date().optional(),
  dayOfMonth: z.number().min(1).max(31),
  autoSend: z.boolean().optional(),
  recipientEmail: z.string().email().optional().or(z.literal("")),
  notificationDaysBefore: z.number().min(0).optional(),
  items: z.array(
    z.object({
      productId: z.string().optional(),
      description: z.string().min(1, "Description requise"),
      quantity: z.string().min(1, "Quantité requise"),
      unitPrice: z.string().min(1, "Prix unitaire requis"),
    })
  ).min(1, "Au moins un article est requis"),
});

type RecurringInvoiceFormValues = z.infer<typeof recurringInvoiceSchema>;

interface RecurringInvoiceFormProps {
  recurringInvoiceId?: string;
  onSuccess?: () => void;
}

export function RecurringInvoiceForm({ recurringInvoiceId, onSuccess }: RecurringInvoiceFormProps) {
  const t = useTranslations("recurringInvoices.form");
  const router = useRouter();
  const isEditMode = !!recurringInvoiceId;

  const { data: existingRecurringInvoice, isLoading: isLoadingExisting } = useGetRecurringInvoiceByIdQuery(
    recurringInvoiceId!,
    { skip: !isEditMode }
  );

  const { data: clientsData } = useGetClientsQuery();
  const clients = clientsData?.data || [];
  const { data: productsData } = useGetProductsQuery();
  const products = productsData?.data || [];

  const [createRecurringInvoice, { isLoading: isCreating }] = useCreateRecurringInvoiceMutation();
  const [updateRecurringInvoice, { isLoading: isUpdating }] = useUpdateRecurringInvoiceMutation();

  const [clientOpen, setClientOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const form = useForm<RecurringInvoiceFormValues>({
    resolver: zodResolver(recurringInvoiceSchema),
    defaultValues: {
      clientId: "",
      name: "",
      frequency: "monthly",
      startDate: new Date(),
      dayOfMonth: 1,
      autoSend: false,
      recipientEmail: "",
      notificationDaysBefore: 0,
      items: [{ description: "", quantity: "1", unitPrice: "" }],
    },
  });

  // Charger les données existantes en mode édition
  useEffect(() => {
    if (isEditMode && existingRecurringInvoice) {
      form.reset({
        clientId: existingRecurringInvoice.clientId,
        name: existingRecurringInvoice.name || "",
        frequency: existingRecurringInvoice.frequency,
        startDate: new Date(existingRecurringInvoice.startDate),
        endDate: existingRecurringInvoice.endDate ? new Date(existingRecurringInvoice.endDate) : undefined,
        dayOfMonth: existingRecurringInvoice.dayOfMonth,
        autoSend: existingRecurringInvoice.autoSend,
        recipientEmail: existingRecurringInvoice.recipientEmail || "",
        notificationDaysBefore: existingRecurringInvoice.notificationDaysBefore,
        items: existingRecurringInvoice.items?.map((item) => ({
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })) || [{ description: "", quantity: "1", unitPrice: "" }],
      });
      setSelectedClientId(existingRecurringInvoice.clientId);
    }
  }, [isEditMode, existingRecurringInvoice, form]);

  const selectedClient = clients.find((c) => c.id === selectedClientId || c.id === form.watch("clientId"));

  const handleSubmit = async (values: RecurringInvoiceFormValues) => {
    try {
      const payload = {
        clientId: values.clientId,
        name: values.name || undefined,
        frequency: values.frequency,
        startDate: format(values.startDate, "yyyy-MM-dd"),
        endDate: values.endDate ? format(values.endDate, "yyyy-MM-dd") : undefined,
        dayOfMonth: values.dayOfMonth,
        autoSend: values.autoSend || false,
        recipientEmail: values.recipientEmail || undefined,
        notificationDaysBefore: values.notificationDaysBefore || 0,
        items: values.items,
      };

      if (isEditMode && recurringInvoiceId) {
        await updateRecurringInvoice({ id: recurringInvoiceId, payload }).unwrap();
        toast.success(t("updateSuccess"));
      } else {
        await createRecurringInvoice(payload).unwrap();
        toast.success(t("createSuccess"));
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/recurring-invoices");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || t("error"));
    }
  };

  const addItem = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [...currentItems, { description: "", quantity: "1", unitPrice: "" }]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues("items");
    form.setValue("items", currentItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const currentItems = form.getValues("items");
    const updatedItems = [...currentItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    form.setValue("items", updatedItems);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      updateItem(index, "productId", productId);
      updateItem(index, "description", product.name);
      updateItem(index, "unitPrice", product.unitPrice);
    }
  };

  if (isEditMode && isLoadingExisting) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? t("editTitle") : t("createTitle")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Client */}
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("client")} <span className="text-destructive">*</span></FormLabel>
                  <Popover open={clientOpen} onOpenChange={setClientOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                          disabled={isCreating || isUpdating}
                        >
                          {selectedClient ? selectedClient.name : t("selectClient")}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder={t("searchClient")} />
                        <CommandList>
                          <CommandEmpty>
                            <div className="py-4 text-center">
                              <p className="text-sm text-muted-foreground mb-2">{t("noClient")}</p>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setClientOpen(false);
                                  setIsClientModalOpen(true);
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                {t("createClient")}
                              </Button>
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {clients.map((client) => (
                              <CommandItem
                                key={client.id}
                                value={client.id}
                                onSelect={() => {
                                  field.onChange(client.id);
                                  setSelectedClientId(client.id);
                                  setClientOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === client.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {client.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nom (optionnel) */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fréquence */}
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("frequency")} <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">{t("frequency.monthly")}</SelectItem>
                      <SelectItem value="quarterly">{t("frequency.quarterly")}</SelectItem>
                      <SelectItem value="yearly">{t("frequency.yearly")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date de début */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("startDate")} <span className="text-destructive">*</span></FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>{t("selectDate")}</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date de fin (optionnelle) */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("endDate")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>{t("selectDate")}</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const startDate = form.getValues("startDate");
                          return startDate && date < startDate;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Jour du mois */}
            <FormField
              control={form.control}
              name="dayOfMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dayOfMonth")} <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Envoi automatique */}
            <FormField
              control={form.control}
              name="autoSend"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t("autoSend")}</FormLabel>
                    <p className="text-sm text-muted-foreground">{t("autoSendDescription")}</p>
                  </div>
                </FormItem>
              )}
            />

            {/* Email destinataire (si autoSend) */}
            {form.watch("autoSend") && (
              <FormField
                control={form.control}
                name="recipientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("recipientEmail")}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t("recipientEmailPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notification avant génération */}
            <FormField
              control={form.control}
              name="notificationDaysBefore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("notificationDaysBefore")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">{t("notificationDaysBeforeDescription")}</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Articles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t("items")} <span className="text-destructive">*</span></Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("addItem")}
                </Button>
              </div>

              {form.watch("items").map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{t("item")} {index + 1}</Badge>
                      {form.watch("items").length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Produit (optionnel) */}
                    <div>
                      <Label>{t("product")}</Label>
                      <Select
                        value={item.productId || ""}
                        onValueChange={(value) => handleProductSelect(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectProduct")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">{t("noProduct")}</SelectItem>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description */}
                    <div>
                      <Label>{t("description")} <span className="text-destructive">*</span></Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        placeholder={t("descriptionPlaceholder")}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Quantité */}
                      <div>
                        <Label>{t("quantity")} <span className="text-destructive">*</span></Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", e.target.value)}
                          placeholder="1"
                        />
                      </div>

                      {/* Prix unitaire */}
                      <div>
                        <Label>{t("unitPrice")} <span className="text-destructive">*</span></Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? t("update") : t("create")}
          </Button>
        </div>
      </form>

      <ClientModal
        open={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={(client) => {
          form.setValue("clientId", client.id);
          setSelectedClientId(client.id);
          setIsClientModalOpen(false);
        }}
      />
    </Form>
  );
}
