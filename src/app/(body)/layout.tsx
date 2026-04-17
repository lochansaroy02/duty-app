import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>

            <Sidebar />

            <div className="flex flex-col min-h-screen lg:ml-[20%]">
                <Header />
                <main className="flex-1 p-6 mt-[72px]">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default layout