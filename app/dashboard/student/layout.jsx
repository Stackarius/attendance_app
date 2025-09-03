"use client"
import Sidebar from "component/student/Sidebar"
import Link from "next/link"

export default function StudentLayout({ children }) {
    
    return (
        <div className="flex h-screen">
           <Sidebar />

            {/* Main content */}
            <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
