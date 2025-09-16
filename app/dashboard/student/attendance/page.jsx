"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import QrScanner from "qr-scanner";
import { X, Check } from "lucide-react";
import { toast } from "react-toastify";

export default function AttendancePage() {
    const [lectures, setLectures] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [studentId, setStudentId] = useState(null);
    const [loading, setLoading] = useState(false);
    const videoRef = useRef(null);
    const scannerRef = useRef(null);

    // Get logged-in student
    useEffect(() => {
        const getProfile = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) setStudentId(user.id);
        };
        getProfile();
    }, []);

    // Fetch lectures & attendance
    useEffect(() => {
        const fetchData = async () => {
            if (!studentId) return;

            const { data: lecturesData } = await supabase
                .from("lectures")
                .select(
                    "id, topic, scheduled_at, course:courses(id, course_code, course_title)"
                )
                .order("scheduled_at", { ascending: false }); // latest first

            const { data: attendanceData } = await supabase
                .from("attendance")
                .select("lecture_id")
                .eq("student_id", studentId);

            if (lecturesData) setLectures(lecturesData);
            if (attendanceData)
                setAttendance(attendanceData.map((a) => a.lecture_id));
        };

        fetchData();
    }, [studentId]);

    // Start QR scanner
    useEffect(() => {
        if (scanning && videoRef.current) {
            scannerRef.current = new QrScanner(
                videoRef.current,
                (result) => handleScan(result.data),
                {
                    highlightScanRegion: true,
                    preferredCamera: "environment",
                }
            );
            scannerRef.current.start();
        }
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop();
                scannerRef.current.destroy();
                scannerRef.current = null;
            }
        };
    }, [scanning]);

    // Handle QR scan
    const handleScan = async (result) => {
        if (!result || !studentId) return;

        if (scannerRef.current) {
            scannerRef.current.stop();
            scannerRef.current.destroy();
            scannerRef.current = null;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/mark-attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, qrToken: result }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to mark attendance");

            if (selectedLecture) {
                setAttendance((prev) => [...prev, selectedLecture.id]);
            }

            // Vibrate phone if supported
            if (navigator.vibrate) navigator.vibrate(150);

            toast.success(`Attendance marked for ${selectedLecture?.topic}`, {
                autoClose: 3000,
            });
        } catch (err) {
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            toast.error(err.message || "Error marking attendance", {
                autoClose: 4000,
            });
        } finally {
            setLoading(false);
            setScanning(false);
            setSelectedLecture(null);
        }
    };

    // Format date/time
    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    };

    // Get lecture status helper function
    const getLectureStatus = (scheduledAt) => {
        const now = new Date();
        const lectureStart = new Date(scheduledAt);
        const attendanceDeadline = new Date(lectureStart.getTime() + 30 * 60 * 1000); // 30 minutes after start

        if (now < lectureStart) {
            return 'upcoming';
        } else if (now >= lectureStart && now <= attendanceDeadline) {
            return 'active'; // Can still mark attendance
        } else {
            return 'closed'; // Past attendance deadline
        }
    };

    // Split lectures based on attendance deadline (not just schedule)
    const now = new Date();
    const activeLectures = lectures.filter((lec) => {
        const status = getLectureStatus(lec.scheduled_at);
        return status === 'upcoming' || status === 'active';
    });

    const closedLectures = lectures.filter((lec) => {
        const status = getLectureStatus(lec.scheduled_at);
        return status === 'closed';
    });

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-6">Attendance</h1>

            {/* Active Lectures (Upcoming + Currently Active) */}
            {activeLectures.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-3 text-gray-800">
                        Available Lectures
                    </h2>
                    <ul className="space-y-3">
                        {activeLectures.map((lec) => {
                            const hasAttended = attendance.includes(lec.id);
                            const status = getLectureStatus(lec.scheduled_at);

                            // Calculate time remaining for active lectures
                            const lectureStart = new Date(lec.scheduled_at);
                            const attendanceDeadline = new Date(lectureStart.getTime() + 30 * 60 * 1000);
                            const timeRemaining = attendanceDeadline - now;
                            const minutesRemaining = Math.floor(timeRemaining / (1000 * 60));

                            return (
                                <li
                                    key={lec.id}
                                    className="flex flex-col md:flex-row items-start p-4 border rounded-lg shadow-sm bg-white flex justify-between items-center"
                                >
                                    <div className="mb-2">
                                        <p className="font-semibold text-gray-900">{lec.topic}</p>
                                        <p className="text-sm text-gray-600">
                                            {lec.course?.course_code} – {lec.course?.course_title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDateTime(lec.scheduled_at)}
                                        </p>
                                        {status === 'active' && !hasAttended && (
                                            <p className="text-xs text-orange-600 mt-1 font-medium">
                                                Attendance closes in {minutesRemaining} min{minutesRemaining !== 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </div>

                                    {hasAttended ? (
                                        <div className="flex items-center text-green-600 font-medium text-sm">
                                            <Check className="mr-1 w-5 h-5" /> Attended
                                        </div>
                                    ) : status === 'upcoming' ? (
                                        <span className="text-gray-400 text-sm">Not started yet</span>
                                    ) : status === 'active' ? (
                                        <button
                                            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-28"
                                            onClick={() => {
                                                setSelectedLecture(lec);
                                                setScanning(true);
                                            }}
                                        >
                                            Mark
                                        </button>
                                    ) : (
                                        <span className="text-red-500 text-sm font-medium">Closed</span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* Closed Lectures */}
            {closedLectures.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-3 text-gray-800">
                        Past Lectures
                    </h2>
                    <ul className="space-y-3">
                        {closedLectures.map((lec) => {
                            const hasAttended = attendance.includes(lec.id);
                            return (
                                <li
                                    key={lec.id}
                                    className="p-4 border rounded-lg shadow-sm bg-white flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-900">{lec.topic}</p>
                                        <p className="text-sm text-gray-600">
                                            {lec.course?.course_code} – {lec.course?.course_title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDateTime(lec.scheduled_at)}
                                        </p>
                                    </div>

                                    {hasAttended ? (
                                        <div className="flex items-center text-green-600 font-medium text-sm">
                                            <Check className="mr-1 w-5 h-5" /> Attended
                                        </div>
                                    ) : (
                                        <span className="text-red-400 text-sm">Missed</span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* Mobile-Friendly Modal */}
            {scanning && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-end sm:items-center sm:justify-center">
                    <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-lg shadow-lg flex flex-col relative animate-slide-up">
                        {/* Close button */}
                        <button
                            onClick={() => setScanning(false)}
                            className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-lg font-semibold mt-5 mb-3 text-center">
                            Scan QR for {selectedLecture?.topic}
                        </h2>

                        <div className="flex-1 flex items-center justify-center p-4">
                            {loading ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-2 text-sm text-gray-600">Processing...</p>
                                </div>
                            ) : (
                                <video
                                    ref={videoRef}
                                    className="w-full h-64 object-cover rounded-lg border"
                                    muted
                                    playsInline
                                ></video>
                            )}
                        </div>

                        <div className="p-4">
                            {!loading && (
                                <button
                                    className="w-full py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition"
                                    onClick={() => setScanning(false)}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}