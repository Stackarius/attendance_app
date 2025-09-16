"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, BarChart2, User } from "lucide-react";
import LogoutButton from "@/component/Logout";

export default function Sidebar() {
    const pathname = usePathname(); 

    const basePath = "/dashboard/student";

    const menuItems = [
        { label: "Home", icon: <Home />, href: `${basePath}` },
        { label: "My Classes", icon: <Calendar />, href: `${basePath}/attendance` },
        { label: "Records", icon: <BarChart2 />, href: `${basePath}/records` },
        { label: "Profile", icon: <User />, href: `${basePath}/profile` },
    ];

    return (
        <aside className="w-64 md:h-full bg-white shadow-md p-4 flex flex-col">
            <h2 className="text-2xl text-gray-700 font-bold mb-6">AttendEase</h2>
            <nav className="space-y-2 flex-1 mb-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href; 

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition ${isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <LogoutButton />
        </aside>
    );
}
