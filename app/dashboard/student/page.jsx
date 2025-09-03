"use client";

import { useState } from "react";
import { Home, Calendar, CheckCircle, BarChart2, User, LogOut, Bell } from "lucide-react";

export default function StudentDashboard() {
    

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {/* Top bar */}
                <div className="flex text-gray-700 justify-between items-center mb-6">
                    <h1 className="text-xl font-semibold text-gray-900">Welcome, Student 👋</h1>
                    <div className="flex items-center gap-4">
                        <Bell className="text-gray-600 w-6 h-6 cursor-pointer" />
                        <img
                            src="/avatar.png"
                            alt="profile"
                            className="w-10 h-10 rounded-full border"
                        />
                    </div>
                </div>

                {/* Dashboard content */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="p-6 bg-white shadow rounded-xl">
                        <p className="text-sm text-gray-500">Attendance %</p>
                        <h2 className="text-2xl font-bold text-blue-600">87%</h2>
                    </div>
                    <div className="p-6 bg-white shadow rounded-xl">
                        <p className="text-sm text-gray-500">Classes Attended</p>
                        <h2 className="text-2xl font-bold text-blue-600">42</h2>
                    </div>
                    <div className="p-6 bg-white shadow rounded-xl">
                        <p className="text-sm text-gray-500">Next Class</p>
                        <h2 className="text-lg font-semibold text-blue-600">Maths @ 2PM</h2>
                    </div>
                </div>

                {/* Today’s schedule */}
                <div className="mt-8 p-6 bg-white shadow rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Today’s Schedule</h3>
                    <ul className="space-y-3 text-gray-500">
                        <li className="flex justify-between">
                            <span >Computer Science - 10AM</span>
                            <span className="text-green-600 font-semibold">Attended</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Mathematics - 2PM</span>
                            <span className="text-yellow-600 font-semibold">Upcoming</span>
                        </li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
