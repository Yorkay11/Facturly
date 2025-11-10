export interface Item {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
}

export interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddItem: (item: Omit<Item, 'id'>) => void;
}

