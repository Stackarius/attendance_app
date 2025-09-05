import LogoutButton from "@/component/Logout";
import Link from "next/link";

export default function LecturerLayout({ children }) {
    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-blue-600 text-white flex flex-col">
                <div className="p-6 text-center border-b border-blue-500">
                    <h1 className="text-2xl font-bold">Lecturer Dashboard</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/dashboard/lecturer"
                        className="block p-2 rounded hover:bg-blue-500 transition"
                    >
                        Create Lecture
                    </Link>
                    <Link
                        href="/lecturer-attendance"
                        className="block p-2 rounded hover:bg-blue-500 transition"
                    >
                        Attendance
                    </Link>
                    <Link
                        href="/lecturer-courses"
                        className="block p-2 rounded hover:bg-blue-500 transition"
                    >
                        Courses
                    </Link>
                    <Link
                        href="/lecturer-profile"
                        className="block p-2 rounded hover:bg-blue-500 transition"
                    >
                        Profile
                    </Link>
                </nav>
                <div className="p-4 border-t border-blue-500">
                   <LogoutButton/>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
    );
}
