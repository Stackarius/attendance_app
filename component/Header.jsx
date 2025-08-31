import Link from "next/link";

export default function Header() {
    
    return (
        <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-10 py-6 bg-transparent z-[999]">
            <h1 className="text-3xl font-extrabold">AttendEase</h1>
            <div className="space-x-4">
                <Link href="/auth" className="hover:text-gray-200">
                    Login
                </Link>
                <Link
                    href="/auth"
                    className="px-5 py-2 rounded-full bg-white text-blue-700 font-semibold shadow-lg hover:scale-105 transition"
                >
                    Get Started
                </Link>
            </div>
        </nav>
    )
}