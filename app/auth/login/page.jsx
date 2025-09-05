"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "lib/supabaseClient";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert(error.message);
            setLoading(false);
            return;
        }

        const role = data.user.user_metadata?.role || "student";
        const redirectUrl =
            role === "admin"
                ? "/dashboard/admin"
                : role === "lecturer"
                    ? "/dashboard/lecturer"
                    : "/dashboard/student";

        router.push(redirectUrl);
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-sm p-6 bg-white shadow-lg rounded-xl"
            >
                <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
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
                    className="w-full p-2 mb-6 border rounded-lg"
                    required
                />
                <button
                    type="submit"
                    className="w-full p-2 bg-blue-600 text-white rounded-lg"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
