import { Button } from '@/components/ui/button'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import EbookTab from './EbookTab';

const EditEbook = () => {
    const navigate = useNavigate();

    return (
        <div className='flex-1 max-w-5xl mx-auto'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8'>
                <h1 className='font-bold text-xl text-gray-500'>Edit your E-Book Details</h1>
                <Button
                    onClick={() => navigate("/instructor/ebook")}
                    variant='link'
                    className='text-teal-600 font-semibold hover:no-underline hover:text-teal-700'
                >
                    View All E-Books
                </Button>
            </div>
            <EbookTab />
        </div>
    )
}

export default EditEbook
