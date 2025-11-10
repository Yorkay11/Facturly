"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown, Edit, TicketPlus, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import dragula from 'dragula';
import 'dragula/dist/dragula.css';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Form,
    FormControl,
    FormDescription,
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
import { toast } from "@/hooks/use-toast"
import { Input } from "../ui/input"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import React, { useEffect, useRef, useState } from "react"
import { Separator } from "../ui/separator"
import { Card } from "../ui/card"
import { Checkbox } from "../ui/checkbox"
import { devises } from "@/data/datas"
import { AddItemModal } from "../smallComponents/AddItem"
import { useItemsStore } from "@/hooks/useItemStore"

const FormSchema = z.object({
    dob: z.date({
        required_error: "A date of birth is required.",
    }),
})

const InvoiceDetails = () => {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const { items, setItems, addItem, removeItem } = useItemsStore();

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            const drake = dragula([containerRef.current]);

            drake.on("drop", () => {
                const reorderedItems = Array.from(containerRef.current?.children || []).map(
                    (child) => {
                        const originalIndex = parseInt(child.getAttribute('data-id') || '0', 10);
                        return items[originalIndex];
                    }
                );

                const reorderedItemsForDragula = Array.from(containerRef.current?.children || []).map(
                    (child) => {
                        const originalIndex2 = Array.from(containerRef.current?.children || []).indexOf(child);
                        return items[originalIndex2];
                    }
                );

                // Mettre à jour le store avec reorderedItems
                setItems(reorderedItems);
                console.log(reorderedItemsForDragula);


            });

            return () => {
                drake.destroy();
            };
        }
    }, [items, setItems]);


    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast({
            title: "You submitted the following values:",
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-[45%]">
                <p className='text-2xl font-bold'>Invoice Details</p>
                <FormField
                    control={form.control}
                    name="dob"
                    render={() => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Receiver</FormLabel>
                            <Input id="destinataire" placeholder="Receiver" className="w-[50%]" />
                            <FormDescription className="text-xs">
                                The name of the receiver to whom the invoice is addressed.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Title</FormLabel>
                            <Input id="subject" placeholder="Object" className="w-[50%]" />
                            <FormDescription className="text-xs">
                                Title of the invoice.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date of Issue</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[50%] pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Select the date</span>
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
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormDescription className="text-xs">
                                The date the invoice was issued.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Currency</FormLabel>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-[50%] justify-between"
                                    >
                                        {value
                                            ? devises.find((devise) => devise.value === value)?.label
                                            : "Select the currency..."}
                                        <ChevronsUpDown className="opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[500px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Select the currency..." className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>No devise found.</CommandEmpty>
                                            <CommandGroup>
                                                {devises.map((devise) => (
                                                    <CommandItem
                                                        key={devise.value}
                                                        value={devise.value}
                                                        onSelect={(currentValue) => {
                                                            setValue(currentValue === value ? "" : currentValue)
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
                            <FormDescription className="text-xs">
                                The currency in which the invoice is written.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Separator />

                <p className='text-2xl font-bold'>Items</p>

                {items.length ? <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel className="text-xs font-semibold flex justify-between px-4">
                                <p>Object</p>
                                <div className="flex flex-row gap-4">
                                    <p>Quantité</p>
                                    <p>Prix Unitaire</p>
                                    <div className="min-w-20 flex justify-center">
                                        <p>Actions</p>
                                    </div>
                                </div>
                            </FormLabel>
                            <div
                                className="flex flex-col gap-2"
                                ref={containerRef}
                            >
                                {
                                    items.map((item, i) => {
                                        return (
                                            <Card
                                                className="p-2 rounded-sm shadow-sm flex-row flex justify-between cursor-grab"
                                                key={i}
                                                data-id={i}
                                            >
                                                <div className="gap-2 flex flex-col">
                                                    <p className="text-sm font-semibold">
                                                        {item.description}
                                                    </p>
                                                    <p className="text-xs">
                                                        {item.unitPrice}
                                                    </p>
                                                </div>

                                                <div className="flex flex-row gap-1">
                                                    <div className="w-auto min-w-20 rounded-sm shadow-sm px-4 flex items-center justify-end">
                                                        <p className="text-xs">{item.quantity}</p>
                                                    </div>
                                                    <div className="w-auto min-w-24 rounded-sm shadow-sm px-4 flex items-center">
                                                        <p className="text-xs">29019</p>
                                                    </div>
                                                    <Button variant={"ghost"} size={"icon"}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant={"destructive"} size={"icon"} onClick={() => removeItem(item.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        )
                                    })
                                }
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                /> : <div className="flex flex-col w-full items-center gap-4">
                    <p className="text-xl font-bold">Empty !</p>
                    <Button
                        className="text-blue-600 py-0 "
                        variant={"outline"} size={"sm"}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <TicketPlus className="" />
                        <p>Add new item</p>
                    </Button>
                    <AddItemModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onAddItem={addItem}
                    />
                </div>}

                {items.length ? <><Button onClick={() => setIsModalOpen(true)} className="text-blue-600 py-0 " variant={"ghost"} size={"sm"}>
                    <TicketPlus className="" />
                    <p>Add new item</p>
                </Button>
                    <AddItemModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onAddItem={addItem}
                    />
                </> : <></>}

                <Separator />

                <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <div className="flex flex-row justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Checkbox id="discount" />
                                    <label
                                        htmlFor="discount"
                                        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Add discount
                                    </label>
                                </div>
                                <Select>
                                    <SelectTrigger className="w-[250px]">
                                        <SelectValue placeholder="Select your discount" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Discount</SelectLabel>
                                            <SelectItem value="10">10% discount</SelectItem>
                                            <SelectItem value="30">30% discount</SelectItem>
                                            <SelectItem value="50">50% discount</SelectItem>
                                            <SelectItem value="70">70% discount</SelectItem>
                                            <SelectItem value="100">100% discount</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date d'émission</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[50%] pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
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
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormDescription className="text-xs">
                                La date de l'émission de la facture.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Separator />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}

export default InvoiceDetails
