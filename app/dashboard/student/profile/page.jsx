"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({ full_name: "", role: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getProfile = async () => {
            setLoading(true);
            try {
                const {
                    data: { user },
                    error: userError,
                } = await supabase.auth.getUser();
                if (userError) throw userError;
                if (!user) return;

                setUser(user);

                const { data, error } = await supabase
                    .from("profiles")
                    .select("full_name, role")
                    .eq("id", user.id)
                    .single();

                if (error) throw error;
                setProfile(data);
            } catch (err) {
                console.error(err.message);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        getProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ full_name: profile.full_name })
                .eq("id", user.id);

            if (error) throw error;
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error(err.message);
            toast.error("Error updating profile");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="text-center mt-20">Loading...</div>;

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-lg">
            <h1 className="text-2xl font-bold mb-6">My Profile</h1>

            <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <input
                        type="text"
                        value={profile.role}
                        disabled
                        className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
}
