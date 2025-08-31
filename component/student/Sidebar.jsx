import { useState } from "react";
import { Home, Calendar, CheckCircle, BarChart2, User, LogOut } from "lucide-react";


export default function Sidebar() {
    const [activeMenu, setActiveMenu] = useState("home");

    const menuItems = [
        { label: "Home", icon: <Home />, key: "home" },
        { label: "My Classes", icon: <Calendar />, key: "classes" },
        { label: "Mark Attendance", icon: <CheckCircle />, key: "attendance" },
        { label: "Records", icon: <BarChart2 />, key: "records" },
        { label: "Profile", icon: <User />, key: "profile" },
        { label: "Logout", icon: <LogOut />, key: "logout" },
    ];
    return (
        <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
            <h2 className="text-2xl text-gray-700 font-bold mb-6">AttendEase</h2>
            <nav className="space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setActiveMenu(item.key)}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg ${activeMenu === item.key
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </nav>
        </aside>
    )
}