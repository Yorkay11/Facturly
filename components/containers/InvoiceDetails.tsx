"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown, Edit, Plus, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "../ui/input"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import React, { useEffect, useMemo, useState } from "react"
import { Separator } from "../ui/separator"
import { Card } from "../ui/card"
import { Checkbox } from "../ui/checkbox"
import { devises } from "@/data/datas"
import { useItemsStore } from "@/hooks/useItemStore"
import { SortableItem } from "./SortableItem"
import { useInvoiceMetadata } from "@/hooks/useInvoiceMetadata"
import { useItemModalControls } from "@/contexts/ItemModalContext"

const FormSchema = z.object({
    receiver: z.string().min(1, "Le destinataire est requis"),
    subject: z.string().min(1, "L&apos;objet est requis"),
    issueDate: z.date({
        required_error: "La date d&apos;émission est requise",
    }),
    dueDate: z.date({
        required_error: "La date d&apos;échéance est requise",
    }),
    currency: z.string().min(1, "La devise est obligatoire"),
    notes: z.string().optional(),
})

const InvoiceDetails = () => {
    const [open, setOpen] = React.useState(false);
    const { items, setItems, removeItem } = useItemsStore();
    const { setMetadata, currency: storedCurrency, ...metadata } = useInvoiceMetadata();
    const [value, setValue] = useState(storedCurrency ?? "");
    const { openCreate, openEdit } = useItemModalControls();

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            receiver: metadata.receiver,
            subject: metadata.subject,
            currency: storedCurrency,
            notes: metadata.notes,
            issueDate: metadata.issueDate,
            dueDate: metadata.dueDate,
        },
    })

    const onSubmit = (data: z.infer<typeof FormSchema>) => {
        console.log({ ...data, items })
    }

    useEffect(() => {
        const subscription = form.watch((values) => {
            setMetadata({
                receiver: values.receiver ?? "",
                subject: values.subject ?? "",
                issueDate: values.issueDate,
                dueDate: values.dueDate,
                currency: values.currency ?? "",
                notes: values.notes ?? "",
            })
        })

        return () => subscription.unsubscribe()
    }, [form, setMetadata])

    useEffect(() => {
        if (storedCurrency && storedCurrency !== value) {
            setValue(storedCurrency)
            form.setValue("currency", storedCurrency)
        }
    }, [storedCurrency, value, form])

    const itemIds = useMemo(() => items.map((item) => item.id), [items])

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        setItems(arrayMove(items, oldIndex, newIndex))
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
                <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                        <p className="text-lg font-semibold text-slate-900">Informations facture</p>
                        <p className="text-sm text-slate-500">Destinataire, objet, date d&apos;émission et échéance.</p>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="receiver"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Destinataire</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nom du client" className="w-full" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Objet</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Projet web, acompte..." className="w-full" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="issueDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date d&apos;émission</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "dd/MM/yyyy")
                                                    ) : (
                                                        <span>Choisir la date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date("2100-01-01")}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date d&apos;échéance</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "dd/MM/yyyy")
                                                    ) : (
                                                        <span>Choisir la date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < form.getValues("issueDate")}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Devise</FormLabel>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={open}
                                                    className="w-full justify-between"
                                                >
                                                    {value
                                                        ? devises.find((devise) => devise.value === value)?.label
                                                        : "Sélectionnez la devise"}
                                                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[320px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Rechercher..." className="h-9" />
                                                <CommandList>
                                                    <CommandEmpty>Aucune devise trouvée</CommandEmpty>
                                                    <CommandGroup>
                                                        {devises.map((devise) => (
                                                            <CommandItem
                                                                key={devise.value}
                                                                value={devise.value}
                                                                onSelect={(currentValue) => {
                                                                    const nextValue = currentValue === value ? "" : currentValue
                                                                    setValue(nextValue)
                                                                    field.onChange(nextValue)
                                                                    setOpen(false)
                                                                }}
                                                            >
                                                                {devise.label}
                                                                <Check
                                                                    className={cn(
                                                                        "ml-auto",
                                                                        value === devise.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
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
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Notes internes</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Mention interne ou conditions de paiement" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </section>

                <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-lg font-semibold text-slate-900">Lignes de facture</p>
                            <p className="text-sm text-slate-500">Ajoutez vos prestations, quantités et tarifs.</p>
                        </div>
                        <Button type="button" size="sm" className="gap-2" onClick={openCreate}>
                            <Plus className="h-4 w-4" />
                            Ajouter une ligne
                        </Button>
                    </div>

                    <Separator />

                    {items.length ? (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                                <div className="flex flex-col gap-3">
                                    {items.map((item) => (
                                        <SortableItem key={item.id} id={item.id}>
                                            <Card className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 shadow-sm">
                                                <div className="flex flex-wrap items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{item.description}</p>
                                                        <p className="text-xs text-slate-500">{item.quantity} × {item.unitPrice} {form.getValues("currency") || ""}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)} aria-label={`Modifier la ligne ${item.description}`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="destructive" size="icon" onClick={() => removeItem(item.id)} aria-label={`Supprimer la ligne ${item.description}`}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 md:grid-cols-4">
                                                    <div>
                                                        <p className="font-medium text-slate-700">Prix unitaire</p>
                                                        <p>{item.unitPrice}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-700">Quantité</p>
                                                        <p>{item.quantity}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-700">TVA</p>
                                                        <p>{item.vatRate}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-700">Total ligne</p>
                                                        <p>{(item.unitPrice * item.quantity).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </Card>
                                        </SortableItem>
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-slate-300 p-12 text-center">
                            <p className="text-lg font-semibold text-slate-600">Aucune ligne pour le moment</p>
                            <p className="text-sm text-slate-500">Ajoutez votre première prestation en cliquant sur le bouton ci-dessus.</p>
                            <Button variant="outline" size="sm" className="gap-2" onClick={openCreate}>
                                <Plus className="h-4 w-4" />
                                Ajouter une ligne
                            </Button>
                        </div>
                    )}
                </section>

                <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2">
                            <Checkbox id="discount" />
                            <label
                                htmlFor="discount"
                                className="text-sm font-medium leading-none"
                            >
                                Ajouter une remise
                            </label>
                        </div>
                        <Select disabled>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="À venir" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="10">10%</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-2 text-sm text-slate-500">
                        <p>Les remises avancées et calculs TVA seront intégrés dans une prochaine version.</p>
                    </div>
                </section>

                <div className="flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" className="w-full sm:w-auto">
                        Enregistrer le brouillon
                    </Button>
                    <Button type="submit" className="w-full sm:w-auto">
                        Préparer l&apos;envoi
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default InvoiceDetails
