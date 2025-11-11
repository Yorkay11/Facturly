'use client'

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemModalProps } from '@/types/items';

export function AddItemModal({ isOpen, onClose, onSubmit, initialItem, mode = 'create' }: ItemModalProps) {
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [vatRate, setVatRate] = useState('20');

  useEffect(() => {
    if (initialItem && mode === 'edit') {
      setDescription(initialItem.description);
      setQuantity(initialItem.quantity.toString());
      setUnitPrice(initialItem.unitPrice.toString());
      setVatRate(initialItem.vatRate.toString());
    } else {
      setDescription('');
      setQuantity('1');
      setUnitPrice('');
      setVatRate('20');
    }
  }, [initialItem, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      description,
      quantity: parseInt(quantity, 10) || 0,
      unitPrice: parseFloat(unitPrice) || 0,
      vatRate: parseFloat(vatRate) || 0,
    }, initialItem?.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Modifier la ligne' : 'Ajouter un article à la facture'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantité
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unitPrice" className="text-right">
                Prix unitaire
              </Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vatRate" className="text-right">
                Taux de TVA
              </Label>
              <Select value={vatRate} onValueChange={setVatRate}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionnez le taux de TVA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="5.5">5.5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{mode === 'edit' ? 'Mettre à jour' : "Ajouter l'article"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

