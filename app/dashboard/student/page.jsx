"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function StudentDashboardPage() {
    const [student, setStudent] = useState(null);
    const [user, setUser] = useState(null);
    const [courseCount, setCourseCount] = useState(0);
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    // Fetch user and profile
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const { data: userData, error: userError } = await supabase.auth.getUser();
                console.log("Auth response:", { user: userData?.user, userError });
                if (userError || !userData?.user) {
                    console.error("Authentication error:", userError?.message);
                    setError("Authentication failed. Please log in.");
                    router.push("/auth/login");
                    return;
                }
                setUser(userData.user);

                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("full_name, role")
                    .eq("id", userData.user.id)
                    .single();

                console.log("Profile response:", { profile, profileError });
                if (profileError) {
                    console.error("Profile fetch error:", profileError.message, profileError.details);
                    setError(`Profile fetch failed: ${profileError.message}`);
                    router.push("/auth/login");
                    return;
                }

                if (profile.role?.toLowerCase() !== "student") {
                    console.error("Invalid role:", profile.role);
                    setError("Access restricted to students only");
                    router.push("/auth/login");
                    return;
                }

                setStudent(profile);
            } catch (err) {
                console.error("Unexpected profile error:", err.message);
                setError("Unexpected error. Please try again.");
                router.push("/auth/login");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    // Fetch course count
    useEffect(() => {
        const fetchCourseCount = async () => {
            try {
                const { count, error } = await supabase
                    .from("courses")
                    .select("id", { count: "exact", head: true });
                console.log("Course count response:", { count, error });
                if (error) {
                    console.error("Course count fetch error:", error.message, error.details);
                    setError("Failed to load course count");
                    setCourseCount(0);
                    return;
                }
                setCourseCount(count || 0);
            } catch (err) {
                console.error("Unexpected course count error:", err.message);
                setError("Unexpected error loading course count");
                setCourseCount(0);
            }
        };
        fetchCourseCount();
    }, []);

    // Fetch lectures
    useEffect(() => {
        const fetchLectures = async () => {
            try {
                const { data: courseIds, error: courseError } = await supabase
                    .from("courses")
                    .select("id");
                console.log("Course IDs response:", { courseIds, courseError });
                if (courseError) {
                    console.error("Course IDs fetch error:", courseError.message, courseError.details);
                    setError("Failed to load courses for lectures");
                    setLectures([]);
                    return;
                }
                if (!courseIds.length) {
                    setLectures([]);
                    return;
                }
                const ids = courseIds.map((c) => c.id);
                console.log("Fetching lectures for course IDs:", ids);
                const { data, error } = await supabase
                    .from("lectures")
                    .select("id, topic, course_id, scheduled_at, qr_code")
                    .in("course_id", ids);
                console.log("Lectures response:", { data, error });
                if (error) {
                    console.error("Lectures fetch error:", error.message, error.details);
                    setError("Failed to load lectures");
                    setLectures([]);
                    return;
                }
                setLectures(data || []);
            } catch (err) {
                console.error("Unexpected lectures error:", err.message);
                setError("Unexpected error loading lectures");
                setLectures([]);
            }
        };
        fetchLectures();
    }, []);

    // Render loading or error state
    if (loading && !student) return <div className="text-center mt-20 text-gray-600">Loading...</div>;
    if (error) return <div className="text-center mt-20 text-red-600">{error}</div>;
    if (!user || !student) return <div className="text-center mt-20 text-gray-600">Authenticating...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>

            {/* Course Count */}
            <section className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Courses</h2>
                <p>You are enrolled in {courseCount} {courseCount === 1 ? "course" : "courses"}.</p>
            </section>

            {/* Lectures */}
            <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Lectures</h2>
                {lectures.length === 0 ? (
                    <p>No upcoming lectures.</p>
                ) : (
                    <ul>
                        {lectures.map((l) => (
                            <li key={l.id} className="border-b py-2">
                                {l.topic} - {new Date(l.scheduled_at).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}