"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/component/Header";
import Link from "next/link";
import { toast } from "react-toastify";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error || !data.user) {
                toast.warn(error?.message || "Error logging in");
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
        } catch (err) {
            console.error(err);
            toast.error("Unexpected error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 text-white">
            <Header />

            <div className="flex flex-1 items-center justify-center px-4">
                <form
                    onSubmit={handleLogin}
                    className="w-full max-w-sm p-6 bg-white text-black shadow-lg rounded-xl"
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
                        className="w-full p-2 mb-4 border rounded-lg"
                        required
                    />

                    <div className="flex justify-between mb-6">
                        <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <div className="flex items-center justify-center mt-4 text-sm">
                        <p className="mr-2">Don't have an account?</p>
                        <Link href="/auth/signup" className="font-semibold text-blue-600 hover:underline">
                            Register
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
