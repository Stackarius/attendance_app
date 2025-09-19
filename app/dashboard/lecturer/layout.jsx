"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // get current path
import LogoutButton from "@/component/Logout";
import { PlusCircle, ClipboardList, BookOpen, User } from "lucide-react"; // icons

export default function LecturerLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname(); // current route

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const menuItems = [
        { label: "Create Lecture", icon: <PlusCircle className="w-5 h-5" />, href: "/dashboard/lecturer" },
        { label: "Attendance", icon: <ClipboardList className="w-5 h-5" />, href: "/dashboard/lecturer/attendance" },
        { label: "Lectures", icon: <BookOpen className="w-5 h-5" />, href: "/dashboard/lecturer/lectures" },
        { label: "Profile", icon: <User className="w-5 h-5" />, href: "/dashboard/lecturer/profile" },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-600 text-white flex flex-col transform transition-transform duration-300 ease-in-out 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0`}
            >
                {/* Header */}
                <div className="p-6 text-center border-b border-blue-500 flex justify-between items-center md:block">
                    <h1 className="text-2xl font-bold">Lecturer Dashboard</h1>
                    {/* Close button (mobile only) */}
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden text-white hover:text-gray-200 focus:outline-none"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href; // exact match
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 p-2 rounded transition ${isActive ? "bg-white text-blue-600 font-medium" : "hover:bg-blue-500"
                                    }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-blue-500">
                    <LogoutButton />
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Main content */}
            <main className="flex-1 p-6 overflow-y-auto md:ml-64">
                {/* Hamburger (mobile only) */}
                <button
                    onClick={toggleSidebar}
                    className="md:hidden mb-4 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>

                {children}
            </main>
        </div>
    );
}
