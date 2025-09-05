"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import  supabase from "lib/supabaseClient";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { role } },
        });

        if (error) {
            alert(error.message);
            setLoading(false);
            return;
        }

        router.push("/auth/login");
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSignup}
                className="w-full max-w-sm p-6 bg-white shadow-lg rounded-xl"
            >
                <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 mb-4 border rounded-lg"
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 mb-4 border rounded-lg"
                    required
                />

                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2 mb-6 border rounded-lg"
                >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                </select>

                <button
                    type="submit"
                    className="w-full p-2 bg-green-600 text-white rounded-lg"
                    disabled={loading}
                >
                    {loading ? "Signing up..." : "Sign Up"}
                </button>
            </form>
        </div>
    );
}
