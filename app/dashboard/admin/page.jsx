"use client";

import { useState } from "react";
import { Calendar, Bell, UserPlus, FileText } from "lucide-react";

export default function AdminDashboard() {


    return (
        <div className="flex h-screen bg-gray-100">

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {/* Top bar */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-semibold text-gray-900">Hello, Admin 👋</h1>
                    <div className="flex items-center gap-4">
                        <Bell className="text-gray-600 w-6 h-6 cursor-pointer" />
                        <img
                            src="/avatar.png"
                            alt="profile"
                            className="w-10 h-10 rounded-full border"
                        />
                    </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-4 gap-6">
                    <div className="p-6 bg-white shadow rounded-xl">
                        <p className="text-sm text-gray-500">Total Students</p>
                        <h2 className="text-2xl text-gray-900 font-bold">1,245</h2>
                    </div>
                    <div className="p-6 bg-white shadow rounded-xl">
                        <p className="text-sm text-gray-500">Avg Attendance %</p>
                        <h2 className="text-2xl font-bold text-green-600">82%</h2>
                    </div>
                    <div className="p-6 bg-white shadow rounded-xl">
                        <p className="text-sm text-gray-500">Active Classes</p>
                        <h2 className="text-2xl text-gray-900 font-bold">12</h2>
                    </div>
                    <div className="p-6 bg-white shadow rounded-xl">
                        <p className="text-sm text-gray-500">Low Attendance Alerts</p>
                        <h2 className="text-2xl font-bold text-red-600">5</h2>
                    </div>
                </div>

                {/* Management shortcuts */}
                <div className="mt-8 flex gap-6">
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg shadow">
                        <UserPlus /> Add Student
                    </button>
                    <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg shadow">
                        <Calendar /> Schedule Class
                    </button>
                    <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg shadow">
                        <FileText /> Generate Report
                    </button>
                </div>
            </main>
        </div>
    );
}
