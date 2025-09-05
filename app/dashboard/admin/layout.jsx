"use client"

import Sidebar from "component/AdminSidebar"

export default function AdminLayout({ children }) {
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
