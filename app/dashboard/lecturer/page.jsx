"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import  supabase  from "@/lib/supabaseClient";
import QRCode from "qrcode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { v4 as uuidv4 } from "uuid";

export default function LecturerDashboardPage() {
    const router = useRouter();

    const [loadingSession, setLoadingSession] = useState(true);
    const [lecturer, setLecturer] = useState(null);

    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [courseError, setCourseError] = useState(null);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [topic, setTopic] = useState("");
    const [scheduledAt, setScheduledAt] = useState(new Date());
    const [creatingLecture, setCreatingLecture] = useState(false);
    const [qrDataURL, setQrDataURL] = useState(null);

    // 1️⃣ Check session & role
    useEffect(() => {
        async function checkRole() {
            setLoadingSession(true);
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;

            if (!user || user.user_metadata?.role !== "lecturer") {
                const role = user?.user_metadata?.role || "student";
                router.push(
                    role === "admin" ? "/dashboard/admin" : "/dashboard/student"
                );
                return;
            }

            setLecturer(user);
            setLoadingSession(false);
        }

        checkRole();
    }, [router]);

    // 2️⃣ Fetch courses
    useEffect(() => {
        if (!lecturer) return;

        const fetchCourses = async () => {
            setLoadingCourses(true);
            setCourseError(null);

            try {
                console.log("Fetching courses for lecturer:", lecturer.id);
                const { data, error, status } = await supabase
                    .from("courses")
                    .select("id, course_code, course_title");

                if (error && status !== 406) {
                    console.log("Supabase error fetching courses:", error.message);
                    setCourseError(error.message);
                    return;
                }

                if (!data || data.length === 0) {
                    console.warn("No courses found for lecturer.");
                    setCourses([]);
                    return;
                }

                console.log("Courses fetched:", data);
                setCourses(data);
            } catch (err) {
                console.error("Unexpected error fetching courses:", err);
                setCourseError(err.message || "Unexpected error");
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchCourses();
    }, [lecturer]);

    // 3️⃣ Create lecture & generate QR
    const handleCreateLecture = async (e) => {
        e.preventDefault();

        if (!selectedCourse || !topic) {
            alert("Please fill all required fields");
            return;
        }

        setCreatingLecture(true);

        try {
            const token = uuidv4();

            const { data: lecture, error } = await supabase
                .from("lectures")
                .insert({
                    course_id: selectedCourse,
                    lecturer_id: lecturer.id,
                    topic,
                    qr_code: token,
                    scheduled_at: scheduledAt.toISOString(),
                })
                .select()
                .single();

            if (error) throw error;

            const qr = await QRCode.toDataURL(token);
            setQrDataURL(qr);
            alert("Lecture created successfully!");
        } catch (err) {
            console.error("Error creating lecture:", err);
            alert("Error creating lecture: " + (err.message || "Unknown error"));
        } finally {
            setCreatingLecture(false);
        }
    };

    if (loadingSession) return <div className="mt-20 text-center">Loading session...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Lecturer Dashboard</h1>

            {/* Courses Section */}
            <section className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Create New Lecture</h2>

                {loadingCourses && <p>Loading courses...</p>}
                {courseError && <p className="text-red-600">Error: {courseError}</p>}
                {!loadingCourses && courses.length === 0 && (
                    <p className="text-gray-600">No courses found. Please add courses in the database.</p>
                )}

                <form onSubmit={handleCreateLecture} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Select Course</label>
                        <select
                            className="w-full border p-2 rounded"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            required
                        >
                            <option value="">--Select Course--</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.course_title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Lecture Topic</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Scheduled Date & Time</label>
                        <DatePicker
                            selected={scheduledAt}
                            onChange={(date) => setScheduledAt(date)}
                            showTimeSelect
                            dateFormat="Pp"
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={creatingLecture || courses.length === 0}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {creatingLecture ? "Creating..." : "Create Lecture & Generate QR"}
                    </button>
                </form>
            </section>

            {/* QR Code */}
            {qrDataURL && (
                <section className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h2 className="text-xl font-semibold mb-4">QR Code for Attendance</h2>
                    <img src={qrDataURL} alt="Lecture QR Code" className="mx-auto max-w-xs" />
                </section>
            )}
        </div>
    );
}
