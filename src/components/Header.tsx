"use client";

import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore"; // Import UI Store
import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const Header = () => {
    const { isLoggedIn, logout, user } = useAuthStore();
    const { toggleSidebar } = useUIStore(); // Use toggle function
    const router = useRouter();
    const [hasHydrated, setHasHydrated] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    const handleLogout = () => {
        logout();
        router.replace("/");
        router.refresh();
    };

    useEffect(() => {
        setHasHydrated(true);
        setIsOnline(window.navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!hasHydrated) return null;

    return (
        <div className="fixed w-full border-b border-neutral-700/50 lg:w-[80%] lg:right-0 glass-effect z-40 flex">
            <div className="flex items-center p-4 justify-between w-full">
                <div className="flex justify-between gap-2 w-full ">
                    {/* Toggle Sidebar on Click */}
                    <button
                        className="lg:hidden z-50 p-2"
                        onClick={toggleSidebar}
                    >
                        <Menu className="text-blue-900" />
                    </button>

                    <div className="flex items-center gap-2">
                        <h1 className="lg:text-xl text-base font-bold text-blue-800">
                            Duty
                        </h1>
                        <div
                            className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}
                            title={isOnline ? 'Online' : 'Offline'}
                        />
                    </div>

                    <div className="flex gap-4 px-2 items-center">
                        <Button
                            onClick={handleLogout}
                            className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
                        >
                            {isLoggedIn ? "Logout" : "Login"}
                            <LogOut className="ml-2 h-4 w-4" />
                        </Button>

                        {isLoggedIn && user?.id && (
                           
                                <Button asChild className="rounded-full bg-blue-800 hover:bg-blue-700 cursor-pointer h-10 w-10 p-0">
                                    <span className="text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
                                </Button>

                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Header;