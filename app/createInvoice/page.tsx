
import InvoiceDetails from '@/components/containers/InvoiceDetails'
import Navbar from '@/components/containers/Navbar'
import Preview from '@/components/containers/Preview';
import React from 'react'


const page = () => {
  
  

  return (
    <div>
        <Navbar />
        <div className='px-20 py-40 flex flex-row w-full justify-between gap-4'>
            <InvoiceDetails />
            <Preview />
        </div>
    </div>
  )
}

export default page