"use client"

import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"
import { ReactNode } from "react"

interface SortableItemProps {
  id: string
  children: ReactNode
}

export const SortableItem = ({ id, children }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    cursor: "grab",
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

export default SortableItem
