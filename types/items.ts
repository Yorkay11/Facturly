export interface Item {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
}

export interface ItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Item, 'id'>, existingId?: string) => void;
    initialItem?: Item;
    mode?: 'create' | 'edit';
}

