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
                if (userError || !userData?.user) {
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

                if (profileError) {
                    setError("Profile fetch failed.");
                    router.push("/auth/login");
                    return;
                }

                if (profile.role?.toLowerCase() !== "student") {
                    setError("Access restricted to students only");
                    router.push("/auth/login");
                    return;
                }

                setStudent(profile);
            } catch (err) {
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
                if (error) {
                    setError("Failed to load course count");
                    setCourseCount(0);
                    return;
                }
                setCourseCount(count || 0);
            } catch (err) {
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
                if (courseError) {
                    setError("Failed to load courses for lectures");
                    setLectures([]);
                    return;
                }
                if (!courseIds.length) {
                    setLectures([]);
                    return;
                }

                const ids = courseIds.map((c) => c.id);
                const { data, error } = await supabase
                    .from("lectures")
                    .select("id, topic, course_id, scheduled_at")
                    .in("course_id", ids)
                    .order("scheduled_at", { ascending: false });

                if (error) {
                    setError("Failed to load lectures");
                    setLectures([]);
                    return;
                }
                setLectures(data || []);
            } catch (err) {
                setError("Unexpected error loading lectures");
                setLectures([]);
            }
        };
        fetchLectures();
    }, []);

    // Split lectures into upcoming and past
    const now = new Date();
    const upcomingLectures = lectures.filter(
        (lec) => new Date(lec.scheduled_at) >= now
    );
    const pastLectures = lectures.filter(
        (lec) => new Date(lec.scheduled_at) < now
    );

    // Format date/time
    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    };

    // Badge helper
    const getBadge = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        if (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        ) {
            return (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">
                    Today
                </span>
            );
        }

        if (
            date.getDate() === tomorrow.getDate() &&
            date.getMonth() === tomorrow.getMonth() &&
            date.getFullYear() === tomorrow.getFullYear()
        ) {
            return (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">
                    Tomorrow
                </span>
            );
        }

        return null;
    };

    // Render states
    if (loading && !student)
        return <div className="text-center mt-20 text-gray-600">Loading...</div>;
    if (error)
        return <div className="text-center mt-20 text-red-600">{error}</div>;
    if (!user || !student)
        return <div className="text-center mt-20 text-gray-600">Authenticating...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>

            {/* Course Count */}
            <section className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Courses</h2>
                <p>
                    You are enrolled in {courseCount}{" "}
                    {courseCount === 1 ? "course" : "courses"}.
                </p>
            </section>

            {/* Upcoming Lectures */}
            <section className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Upcoming Lectures</h2>
                {upcomingLectures.length === 0 ? (
                    <p>No upcoming lectures.</p>
                ) : (
                    <ul>
                        {upcomingLectures.map((l) => (
                            <li key={l.id} className="border-b py-2 flex items-center">
                                <span>
                                    {l.topic} - {formatDateTime(l.scheduled_at)}
                                </span>
                                {getBadge(l.scheduled_at)}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Past Lectures */}
            <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Past Lectures</h2>
                {pastLectures.length === 0 ? (
                    <p>No past lectures.</p>
                ) : (
                    <ul>
                        {pastLectures.map((l) => (
                            <li key={l.id} className="border-b py-2 text-gray-600">
                                {l.topic} - {formatDateTime(l.scheduled_at)}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
