"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import QrScanner from "qr-scanner";
import { X } from "lucide-react";

export default function AttendancePage() {
    const [lectures, setLectures] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [studentId, setStudentId] = useState(null);
    const [message, setMessage] = useState("");
    const videoRef = useRef(null);
    const scannerRef = useRef(null);

    // ✅ Get logged-in student
    useEffect(() => {
        const getProfile = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) setStudentId(user.id);
        };
        getProfile();
    }, []);

    // ✅ Fetch lectures list
    useEffect(() => {
        const fetchLectures = async () => {
            let { data, error } = await supabase.from("lectures").select("*");
            if (!error) setLectures(data);
        };
        fetchLectures();
    }, []);

    // ✅ Start QR scanner when modal opens
    useEffect(() => {
        if (scanning && videoRef.current) {
            scannerRef.current = new QrScanner(
                videoRef.current,
                (result) => handleScan(result.data),
                {
                    highlightScanRegion: true,
                    preferredCamera: "environment", // 👈 mobile rear camera
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

    // ✅ Handle QR scan result
    const handleScan = async (result) => {
        if (!result || !studentId) return;

        // 👉 Stop scanning immediately after first result
        if (scannerRef.current) {
            scannerRef.current.stop();
            scannerRef.current.destroy();
            scannerRef.current = null;
        }
        setScanning(false);

        try {
            const res = await fetch("/api/attendance/mark", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId,
                    qrToken: result,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to mark attendance");

            setMessage(`✅ Attendance marked for ${selectedLecture?.title}`);
        } catch (err) {
            setMessage(`❌ ${err.message}`);
        } finally {
            setSelectedLecture(null);
        }
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Attendance</h1>

            {message && (
                <div className="p-2 bg-gray-100 rounded text-sm">{message}</div>
            )}

            {/* Lectures List */}
            <ul className="space-y-2">
                {lectures.map((lec) => (
                    <li
                        key={lec.id}
                        className="flex justify-between items-center p-3 border rounded"
                    >
                        <span>{lec.title}</span>
                        <button
                            className="px-3 py-1 bg-blue-600 text-white rounded"
                            onClick={() => {
                                setSelectedLecture(lec);
                                setScanning(true);
                            }}
                        >
                            Mark Attendance
                        </button>
                    </li>
                ))}
            </ul>

            {/* Custom Modal */}
            {scanning && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                        {/* Close button */}
                        <button
                            onClick={() => setScanning(false)}
                            className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-lg font-semibold mb-4 text-center">
                            Scan QR for {selectedLecture?.title}
                        </h2>

                        <video
                            ref={videoRef}
                            className="w-full rounded border"
                            muted
                            playsInline
                        ></video>

                        <div className="mt-4 flex justify-center">
                            <button
                                className="px-4 py-2 bg-gray-500 text-white rounded"
                                onClick={() => setScanning(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
