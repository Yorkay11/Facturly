"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { MdAttachEmail } from "react-icons/md";
import { Separator } from "../ui/separator";
import { RiExchange2Line } from "react-icons/ri";
import { FaSave, FaShareAlt } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useItemsStore } from "@/hooks/useItemStore";

const DetailsSection = ({ title, details }: { title: string; details: string[] }) => (
  <div className="flex flex-col gap-2">
    <p className="text-xs font-bold text-blue-600">{title}</p>
    <Separator />
    {details.map((detail, index) => (
      <p key={index} className="text-xs font-thin">
        {detail}
      </p>
    ))}
  </div>
);

const Preview = () => {
  const [loading, setLoading] = useState(false);
  const { items } = useItemsStore();

  const onLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 3000);    
  };

  useEffect(() => {
    onLoading();
  }, [items])
  

  const totalAmount = items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  );

  return (
    <div className="flex-1 w-[45%] bg-gray-100 right-0 rounded-xl p-12 space-y-6 relative">
      <Button
        className={`absolute top-12 z-10 left-[-32px] p-8 rounded-full h-16 w-16 ${
          loading ? "animate-spin" : ""
        }`}
        variant="outline"
        disabled={loading}
        onClick={onLoading}
      >
        <RiExchange2Line className="h-8 w-8" />
      </Button>

      <div className="flex flex-row items-center justify-between">
        <p className="text-3xl font-bold">Preview</p>
        <div className="flex flex-row gap-2">
          <Button variant="outline">
            <FaShareAlt className="h-4 w-4" />
            <p className="text-xs font-thin">Share</p>
          </Button>
          <Button variant="ghost" className="bg-green-300">
            <FaSave className="h-4 w-4" />
            <p className="text-xs font-thin">Save</p>
          </Button>
        </div>
      </div>

      <Separator />

      <div className="h-[100vh] w-full bg-white rounded-md shadow-lg px-12 py-16 space-y-12 relative">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col space-y-12">
            <DetailsSection
              title="DEVONE CONSULTING"
              details={[
                "Totsi, LOME-TOGO",
                "www.devoneconsulting.com",
                "BP: 99345",
              ]}
            />
            <DetailsSection
              title="ADRESSEE A"
              details={[
                "John Smith",
                "Totsi, LOME-TOGO",
                "johnsmith@gmail.com",
              ]}
            />
          </div>
          <div className="flex flex-col gap-2 items-center">
            <img src="/test.png" className="h-[150px] w-[150px]" alt="Logo" />
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold">No Facture:</p>
              <p className="text-xs font-thin">#INVO1982</p>
              <p className="text-xs font-bold">Date Facture:</p>
              <p className="text-xs font-thin">05/24/2024</p>
              <p className="text-xs font-bold">Date Fin Validité:</p>
              <p className="text-xs font-thin">15/24/2024</p>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-right font-bold">Numéro</TableHead>
              <TableHead className="text-right font-bold">Produit</TableHead>
              <TableHead className="text-right font-bold">P.U.</TableHead>
              <TableHead className="text-right font-bold">Quantité</TableHead>
              <TableHead className="text-right font-bold">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium text-right text-xs">
                  {invoice.id}
                </TableCell>
                <TableCell className="font-medium text-right text-xs">
                  {invoice.description}
                </TableCell>
                <TableCell className="text-right text-xs">
                  {invoice.unitPrice}
                </TableCell>
                <TableCell className="text-right text-xs">
                  {invoice.quantity}
                </TableCell>
                <TableCell className="text-right text-xs">
                  {invoice.unitPrice * invoice.quantity}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-right font-bold text-lg">
                TOTAL
              </TableCell>
              <TableCell className="text-right font-semibold text-lg">
                {totalAmount.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {/* Signature */}
        <div className="flex w-auto flex-col items-end mt-8 pr-12 gap-4">
          <img src="/signature.png" className="h-[100px] w-[100px]" alt="Signature" />
          <p className="text-xs font-bold">York Wona</p>
        </div>

        {/* Footer */}
        <div className="bottom-12 flex absolute w-full h-auto flex flex-row py-2 gap-4">
          <div className="border border-gray-300 rounded-lg p-2 flex items-center justify-center">
            <img src="/qrcode.png" className="h-[50px] w-[50px]" alt="QR Code" />
          </div>
          <div className="max-w-[50%]">
            <p className="text-xs font-bold">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </p>
            <p className="text-xs font-thin">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis cum officiis autem numquam, soluta incidunt et id recusandae rem?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
