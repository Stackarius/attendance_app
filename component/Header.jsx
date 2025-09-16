'use client'
import { MenuIcon, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";


export default function Header() {
    
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Detect scroll
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    const navLinks = [
        {"title": "Home", "href": "/"},
        {"title": "About", "href": "/about"},
        {"title": "Contact", "href": "/contact"},
        { "title": "Get Started", "href": "/auth/signup" },
    ]
    
    return (
        <>
            <nav className={`fixed flex items-center justify-between p-4 pt-6 md:p-10 md:pt-6 top-0 left-0 w-full z-50 transition-colors duration-300 ${scrolled ? "backdrop-blur-md bg-black/30" : "bg-transparent"}`}>
                <h1 className="text-lg md:text-3xl font-extrabold text-white">AttendEase</h1>
                <div className="hidden md:flex gap-8 items-center font-semibold">
                    {navLinks.map((nav_link, index) => (
                        <Link id={index}
                            key={index}
                            href={nav_link.href}
                            className={index == navLinks.length -1 ? "px-5 py-2 rounded-full bg-white text-blue-700 font-semibold shadow-lg hover:scale-105 transition" : " text-white hover:text-gray-200"}
                        >
                            {nav_link.title}</Link>
                    ))}
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="md:hidden bg-white p-1 rounded-full text-black focus:outline-none z-[60]">
                    {isOpen ? <X size={20} /> : <MenuIcon size={20} />}
                </button>
            </nav>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: "100%" }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: "100%" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="fixed h-full inset-0 bg-black/95 flex flex-col items-center justify-center gap-6 text-lg font-medium z-40"
                >
                    {navLinks.map((link, index) => (
                        <Link key={index} href={link.href} className="text-white hover:text-yellow-400 transition" onClick={() => setIsOpen(false)}>
                            {link.title}
                        </Link>
                    ))}
                    
                </motion.div>
            )}
        </>
    )
}