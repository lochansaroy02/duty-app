"use client";

import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import {
    Briefcase,
    LayoutDashboard,
    LogOut,
    Shield,
    UserPlus,
    X
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';

const Sidebar = () => {
    const path = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { isSidebarOpen, closeSidebar } = useUIStore();

    const sidebarData = useMemo(() => {
        const baseRoutes = [
            { name: "Dashboard", link: "/dashboard", icon: <LayoutDashboard size={18} /> },
            { name: "Manage Staff", link: "/add-staff", icon: <UserPlus size={18} /> },
            { name: "Operational Duties", link: "/duty", icon: <Briefcase size={18} /> },
        ];

        if (user?.role === 'ADMIN') {
            return [
                ...baseRoutes,
                { name: "Station Users", link: "/users", icon: <Shield size={18} /> },
            ];
        }
        return baseRoutes;
    }, [user]);

    return (
        <>
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            <div className={`
                fixed top-0 left-0 h-screen z-50 transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:w-[20%] lg:flex border-r border-slate-200 bg-white
                ${isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"}
            `}>
                <div className='p-6 h-full w-full flex flex-col gap-8'>
                    {/* Header & Logo */}
                    <div className="flex items-center justify-between">
                        <div className='flex items-center gap-3'>
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Shield size={28} className="text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 tracking-tight leading-none text-lg">POLICE</span>
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Management</span>
                            </div>
                        </div>
                        <button onClick={closeSidebar} className="lg:hidden p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>

                    <div className='flex flex-col justify-between h-full w-full'>
                        {/* Navigation Links */}
                        <div className='flex flex-col gap-1.5 w-full'>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-4">Main Menu</p>
                            {sidebarData.map((item, index) => {
                                const isActive = path === item.link || path.startsWith(`${item.link}/`);

                                return (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            router.push(item.link);
                                            closeSidebar();
                                        }}
                                        className={`
                                            w-full cursor-pointer py-3 px-4 transition-all duration-200 rounded-xl flex items-center gap-3 group
                                            ${isActive
                                                ? "bg-primary text-white shadow-lg shadow-blue-900/10"
                                                : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"}
                                        `}
                                    >
                                        <span className={`transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-primary"}`}>
                                            {item.icon}
                                        </span>
                                        <h1 className={`text-sm font-semibold ${isActive ? "text-white" : "text-slate-600"}`}>
                                            {item.name}
                                        </h1>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-6 border-t border-slate-100">
                            <div
                                onClick={() => {
                                    logout();
                                    router.push('/login');
                                }}
                                className="w-full cursor-pointer py-3 px-4 transition-all duration-200 rounded-xl flex items-center gap-3 text-slate-500 hover:bg-red-50 hover:text-red-600 group"
                            >
                                <LogOut size={18} className="group-hover:text-red-600" />
                                <h1 className='text-sm font-semibold'>Sign Out</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;