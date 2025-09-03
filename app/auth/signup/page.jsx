"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function SignupPage() {
    const router = useRouter();
    const [fullname, setFullname] = useState("");
    const [matricNo, setMatricNo] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student"); // default student
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name: fullname, matric_no: matricNo, email, password, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Signup failed");
            } else {
                toast.success(data.message || "Signup successful 🎉");
                if (result.role === "student") router.push("/dashboard/student");
                else if (result.role === "lecturer") router.push("/dashboard/lecturer");
                else if (result.role === "admin") router.push("/dashboard/admin");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 text-black">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-2xl shadow-md w-full max-w-sm"
            >
                <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>

                <input
                    type="text"
                    placeholder="Full name"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    required
                    className="w-full mb-3 p-2 border rounded-md"
                />

                <input
                    type="text"
                    placeholder="Matric No"
                    value={matricNo}
                    onChange={(e) => setMatricNo(e.target.value)}
                    required
                    className="w-full mb-3 p-2 border rounded-md"
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full mb-3 p-2 border rounded-md"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full mb-3 p-2 border rounded-md"
                />

                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full mb-3 p-2 border rounded-md"
                >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                </select>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? "Signing up..." : "Sign Up"}
                </button>
            </form>
        </div>
    );
}
