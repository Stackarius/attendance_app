"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/component/Header";

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
        role: "student",
        matric_no: "",
        staff_no: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Signup failed");

            router.push(data.redirect);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 bg-gray-100 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700">
            <div className="w-full max-w-md space-y-8">
                <Header />
                {/* Header */}
                <div className="text-center pt-30">
                    <h1 className="text-3xl font-bold text-white">Create Account</h1>
                    <p className="mt-2 text-sm text-white/80">
                        Sign up to start using Attendance App
                    </p>
                </div>

                {/* Signup Card */}
                <div className="rounded-2xl bg-white p-8 shadow-lg">
                    <form onSubmit={handleSubmit} className="max-w-md">
                        {/* Full Name */}
                        <div className="grid grid-cols-1 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={form.full_name}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 sm:text-sm"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={form.email}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 sm:text-sm"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={form.password}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 sm:text-sm"
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Role
                                </label>
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 sm:text-sm"
                                >
                                    <option value="student">Student</option>
                                    <option value="lecturer">Lecturer</option>
                                </select>
                            </div>

                            {/* Conditional Inputs */}
                            {form.role === "student" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Matric No
                                    </label>
                                    <input
                                        type="text"
                                        name="matric_no"
                                        value={form.matric_no}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 sm:text-sm"
                                    />
                                </div>
                            )}
                            {form.role === "lecturer" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Staff No
                                    </label>
                                    <input
                                        type="text"
                                        name="staff_no"
                                        value={form.staff_no}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 sm:text-sm"
                                    />
                                </div>
                            )}
                       </div>

                        {/* Error */}
                        {error && (
                            <div className="rounded-md bg-red-50 p-2 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                        >
                            {loading ? "Creating account..." : "Sign Up"}
                        </button>
                    </form>

                    {/* Link to login */}
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link
                            href="/auth/login"
                            className="font-medium text-blue-600 hover:text-blue-700"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}
