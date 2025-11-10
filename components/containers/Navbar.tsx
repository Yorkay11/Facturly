import React from 'react'
import { Separator } from '../ui/separator'
import { BadgeHelp, X } from 'lucide-react'
import { Button } from '../ui/button'

const Navbar = () => {
    return (
        <nav className='border-b px-20 py-4 w-full flex flex-row fixed bg-white justify-between z-20'>
            <div className='flex flex-row gap-4 items-center'>
                <p className='text-xl font-bold'>YorkFacture</p>
                <Separator orientation='vertical' />
                <p className='text-sm'>Créer une facture</p>
            </div>
            <div className='flex flex-row gap-4 items-center'>
                <div className='flex flex-row gap-2 items-center'>
                    <BadgeHelp className='h-4 w-4' />
                    <p className='text-sm'>Avez-vous besoin d'aide?</p>
                </div>
                <Separator orientation='vertical' />
                <Button className='items-center justify-center rounded-full' variant={"outline"} size={"icon"}>
                    <X />
                </Button>
            </div>
        </nav>
    )
}

export default Navbar