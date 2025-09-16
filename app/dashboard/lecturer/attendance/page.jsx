"use client";

import { useEffect, useState } from "react";
import { Users, Calendar, BookOpen, ChevronDown, ChevronUp, Download, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function AttendancePage() {
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedLecture, setExpandedLecture] = useState(null);
    const [attendanceData, setAttendanceData] = useState({});
    const [loadingAttendance, setLoadingAttendance] = useState({});

    useEffect(() => {
        fetchLectures();
    }, []);

    const fetchLectures = async () => {
        console.log('Starting fetchLectures...');
        setLoading(true);

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        console.log('User data:', user);
        console.log('User error:', userError);

        if (!user) {
            console.log('No user found, setting empty lectures');
            setLectures([]);
            setLoading(false);
            return;
        }

        console.log('Fetching lectures for user ID:', user.id);

        const { data: lecturesData, error } = await supabase
            .from("lectures")
            .select(`
                id, 
                topic, 
                scheduled_at,
                course:courses(
                    course_code,
                    course_title
                )
            `)
            .eq("lecturer_id", user.id)
            .order('scheduled_at', { ascending: false });

        console.log('Raw lectures query result:', { data: lecturesData, error });

        if (error) {
         console.log('Error fetching lectures:', error);
            setLectures([]);
            setLoading(false);
            return;
        }

        // Get attendance counts for all lectures
        const lecturesWithCounts = await Promise.all(
            lecturesData.map(async (lecture) => {
                const { count } = await supabase
                    .from("attendance")
                    .select("*", { count: "exact", head: true })
                    .eq("lecture_id", lecture.id);

                return {
                    ...lecture,
                    attendanceCount: count ?? 0,
                };
            })
        );

        setLectures(lecturesWithCounts);
        setLoading(false);
    };

    const fetchAttendanceDetails = async (lecture) => {
        if (attendanceData[lecture.id]) {
            // Data already loaded, just toggle
            setExpandedLecture(expandedLecture === lecture.id ? null : lecture.id);
            return;
        }

        setLoadingAttendance(prev => ({ ...prev, [lecture.id]: true }));
        setExpandedLecture(lecture.id);

        try {
            // Get attendance records with student details
            const { data: attendanceRecords, error: attendanceError } = await supabase
                .from("attendance")
                .select(`
                    id,
                    marked_at,
                    student:profiles!student_id(
                        id,
                        full_name,
                        email,
                        matric_no
                    )
                `)
                .eq("lecture_id", lecture.id)
                .order('marked_at', { ascending: true });

            if (attendanceError) {
                console.log('Error fetching attendance:', attendanceError);
                setAttendanceData(prev => ({
                    ...prev,
                    [lecture.id]: { students: [], error: 'Failed to load attendance data' }
                }));
                return;
            }

            setAttendanceData(prev => ({
                ...prev,
                [lecture.id]: {
                    students: attendanceRecords || [],
                    error: null
                }
            }));
        } catch (error) {
            console.log('Unexpected error:', error);
            setAttendanceData(prev => ({
                ...prev,
                [lecture.id]: { students: [], error: 'Failed to load attendance data' }
            }));
        } finally {
            setLoadingAttendance(prev => ({ ...prev, [lecture.id]: false }));
        }
    };

    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    };

    const formatTimeOnly = (dateStr) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', {
            timeStyle: 'short'
        }).format(date);
    };

    const getLectureStatus = (scheduledAt) => {
        const now = new Date();
        const lectureStart = new Date(scheduledAt);
        const attendanceDeadline = new Date(lectureStart.getTime() + 30 * 60 * 1000);

        if (now < lectureStart) {
            return { status: 'upcoming', color: 'bg-blue-100 text-blue-800', label: 'Upcoming' };
        } else if (now >= lectureStart && now <= attendanceDeadline) {
            return { status: 'active', color: 'bg-green-100 text-green-800', label: 'Active' };
        } else {
            return { status: 'completed', color: 'bg-gray-100 text-gray-800', label: 'Completed' };
        }
    };

    const exportAttendance = (lecture) => {
        const attendees = attendanceData[lecture.id]?.students || [];
        if (attendees.length === 0) return;

        const csvContent = [
            ['Name', 'Email', 'Student ID', 'Time Marked'].join(','),
            ...attendees.map(record => [
                record.student?.full_name || 'N/A',
                record.student?.email || 'N/A',
                record.student?.matric_no || 'N/A',
                formatDateTime(record.marked_at)
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${lecture.topic}_attendance_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading attendance records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    Attendance Records
                </h1>
                <p className="text-gray-600 mt-2">View and manage attendance for your lectures</p>
            </div>

            {lectures.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <BookOpen className="w-16 h-16 mx-auto" />
                    </div>
                    <p className="text-gray-600 text-lg">No lectures found</p>
                    <p className="text-gray-500 text-sm mt-2">Create some lectures to see attendance records</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {lectures.map((lecture) => {
                        const isExpanded = expandedLecture === lecture.id;
                        const lectureStatus = getLectureStatus(lecture.scheduled_at);
                        const attendanceInfo = attendanceData[lecture.id];
                        const isLoadingThisLecture = loadingAttendance[lecture.id];

                        return (
                            <div
                                key={lecture.id}
                                className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Lecture Header */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {lecture.topic}
                                                </h3>
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${lectureStatus.color}`}>
                                                    {lectureStatus.label}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4" />
                                                    <span>{lecture.course?.course_code} - {lecture.course?.course_title}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDateTime(lecture.scheduled_at)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    <span className="font-medium">
                                                        {lecture.attendanceCount} student{lecture.attendanceCount !== 1 ? 's' : ''} attended
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            {lecture.attendanceCount > 0 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        exportAttendance(lecture);
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Export attendance"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            )}

                                            {lecture.attendanceCount > 0 && (
                                                <button
                                                    onClick={() => fetchAttendanceDetails(lecture)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    {isExpanded ? (
                                                        <>
                                                            <EyeOff className="w-4 h-4" />
                                                            Hide Details
                                                            <ChevronUp className="w-4 h-4" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="w-4 h-4" />
                                                            View Details
                                                            <ChevronDown className="w-4 h-4" />
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Attendance Details */}
                                {isExpanded && (
                                    <div className="border-t bg-gray-50">
                                        <div className="p-6">
                                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <Users className="w-5 h-5" />
                                                Students Who Attended ({lecture.attendanceCount})
                                            </h4>

                                            {isLoadingThisLecture ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                                                    <span className="text-gray-600">Loading attendance details...</span>
                                                </div>
                                            ) : attendanceInfo?.error ? (
                                                <div className="text-center py-8">
                                                    <p className="text-red-600">{attendanceInfo.error}</p>
                                                </div>
                                            ) : attendanceInfo?.students?.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-600">No students attended this lecture</p>
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="border-b border-gray-200">
                                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Student Name</th>
                                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Student ID</th>
                                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Time Marked</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {attendanceInfo?.students?.map((record, index) => (
                                                                <tr
                                                                    key={record.id}
                                                                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                                                                >
                                                                    <td className="py-3 px-4 font-medium text-gray-900">
                                                                        {record.student?.full_name || 'N/A'}
                                                                    </td>
                                                                    <td className="py-3 px-4 text-gray-600">
                                                                        {record.student?.email || 'N/A'}
                                                                    </td>
                                                                    <td className="py-3 px-4 text-gray-600">
                                                                        {record.student?.matric_no || 'N/A'}
                                                                    </td>
                                                                    <td className="py-3 px-4 text-gray-600">
                                                                        {formatTimeOnly(record.marked_at)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}