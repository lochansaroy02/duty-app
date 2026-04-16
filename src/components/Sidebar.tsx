"use client";

import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore'; // Import UI Store
import { LayoutDashboard, Shield, Siren, Users, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';

const Sidebar = () => {
    const path = usePathname();
    const router = useRouter();
    const { user } = useAuthStore();
    const { isSidebarOpen, closeSidebar } = useUIStore(); // Use global state

    const sidebarData = useMemo(() => {
        const baseRoutes = [
            { name: "Dashboard", link: "/dashboard", icon: <LayoutDashboard size={16} /> },
            { name: "Add Staff", link: "/add-staff", icon: <Users size={16} /> },
            { name: "Add Duty", link: "/duty", icon: <Siren size={16} /> },
        ];
        if (user?.role === 'ADMIN') {
            return [
                ...baseRoutes,
                { name: "Users", link: "/users", icon: <Users size={16} /> },
            ];
        }
        return baseRoutes;
    }, [user]);

    return (
        <>
            {/* Mobile Backdrop: Closes sidebar when clicking outside */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            <div className={`
                fixed top-0 left-0 h-screen z-50 transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:w-[20%] lg:flex lg:glass-effect border-r border-neutral-500/20 bg-white
                ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}
            `}>
                <div className='p-4 h-full w-full flex flex-col gap-6'>
                    {/* Close button for mobile */}
                    <div className="flex lg:hidden justify-end">
                        <button onClick={closeSidebar} className="p-2">
                            <X size={20} />
                        </button>
                    </div>

                    <div className='flex justify-center w-full py-4'>
                        <Shield size={60} className="text-blue-800" />
                    </div>

                    <div className='flex flex-col justify-between h-full w-full'>
                        <div className='flex flex-col gap-2 w-full'>
                            {sidebarData.map((item, index) => {
                                const isActive = path === item.link || path.startsWith(`${item.link}/`);

                                return (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            router.push(item.link);
                                            closeSidebar(); // Close on navigation (mobile)
                                        }}
                                        className={`
                                            w-full cursor-pointer py-3 px-4 transition-all duration-200 rounded-lg flex items-center gap-3
                                            ${isActive
                                                ? "bg-blue-800 text-white shadow-md"
                                                : "hover:bg-neutral-100 text-neutral-600"}
                                        `}
                                    >
                                        <span className={`${isActive ? "text-white" : "text-neutral-500"}`}>
                                            {item.icon}
                                        </span>
                                        <h1 className='text-sm font-medium'>{item.name}</h1>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;