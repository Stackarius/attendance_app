'use client'

import { useState } from 'react';
import { Home, Users, Calendar, BarChart2, Settings, Bell, UserPlus, FileText } from "lucide-react";


const Sidebar = () => {

    const [activeMenu, setActiveMenu] = useState("dashboard");

    const menuItems = [
        { label: "Dashboard", icon: <Home />, key: "dashboard" },
        { label: "Manage Students", icon: <Users />, key: "students" },
        { label: "Manage Lecturers", icon: <Users />, key: "lecturers" },
        { label: "Classes", icon: <Calendar />, key: "classes" },
        { label: "Reports", icon: <BarChart2 />, key: "reports" },
        { label: "Settings", icon: <Settings />, key: "settings" },
    ];

  return (
      <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
          <h2 className="text-2xl text-gray-900 font-bold mb-6">AttendEase</h2>
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

export default Sidebar