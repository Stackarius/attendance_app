"use client";

import { motion } from "framer-motion";

export default function DashboardPreview() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative mt-16 max-w-5xl w-full mx-auto flex justify-center items-center"
        >
            {/* Admin Dashboard - behind */}
            <div className="absolute top-10 right-10 w-[85%] md:w-[70%] opacity-80 blur-[1px] hover:blur-0 transition-all duration-500">
                <img
                    src="/admin-dashboard.png"
                    alt="Admin dashboard preview"
                    className="rounded-2xl shadow-xl border border-white/10"
                />
                <span className="absolute top-3 left-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full shadow">
                    Admin Dashboard
                </span>
            </div>

            {/* Student Dashboard - front */}
            <div className="relative z-10 w-[90%] md:w-[75%]">
                <img
                    src="/dashboard.png"
                    alt="Student dashboard preview"
                    className="rounded-2xl shadow-2xl border border-white/20 transition-transform duration-500 hover:scale-[1.02]"
                />
                <span className="absolute top-3  bg-yellow-500 text-black text-xs font-semibold px-3 py-1 rounded-full shadow">
                    Student Dashboard
                </span>
            </div>
        </motion.div>
    );
}
