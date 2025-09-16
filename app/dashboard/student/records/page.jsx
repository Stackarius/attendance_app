"use client";

import { Clock } from "lucide-react";

export default function RecordsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <div className="bg-white shadow-md rounded-lg p-8 text-center">
                <Clock className="mx-auto text-gray-400 w-12 h-12 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Records</h1>
                <p className="text-gray-600">This feature is coming soon 🚀</p>
            </div>
        </div>
    );
}
