'use client'

import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react"
import QRCode from "qrcode"

export default function LecturesPage() {
    const [lectures, setLectures] = useState([])
    const [loading, setLoading] = useState(false)
    const [expandedLecture, setExpandedLecture] = useState(null)
    const [qrCodes, setQrCodes] = useState({}) // Store QR codes
    const [generatingQr, setGeneratingQr] = useState(false)

    useEffect(() => {
        fetchLectures()
    }, [])

    const fetchLectures = async () => {
        setLoading(true)
        try {
            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError) {
                console.error('Error fetching user:', userError.message)
                setLectures([])
                return
            }

            if (!user) {
                console.error('No user found')
                setLectures([])
                return
            }

            // Fetch lectures for current lecturer with course details
            const { data: lecturesData, error: lectureError } = await supabase
                .from("lectures")
                .select(`
                    id, 
                    topic, 
                    scheduled_at,
                    qr_code,
                    course:courses(
                        course_code,
                        course_title
                    )
                `)
                .eq("lecturer_id", user.id)
                .order('scheduled_at', { ascending: false })

            if (lectureError) {
                console.error('Error fetching lectures:', lectureError)
                setLectures([])
                return
            }

            setLectures(lecturesData || [])
        } catch (error) {
            console.error('Unexpected error:', error)
            setLectures([])
        } finally {
            setLoading(false)
        }
    }

    const generateQRCode = async (lecture) => {
        if (qrCodes[lecture.id]) {
            return // QR code already generated
        }

        setGeneratingQr(true)
        try {
            // Generate QR code from the lecture's qr_token
            const qrCodeDataUrl = await QRCode.toDataURL(lecture.qr_code, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            })

            setQrCodes(prev => ({
                ...prev,
                [lecture.id]: qrCodeDataUrl
            }))
        } catch (error) {
            console.error('Error generating QR code:', error)
        } finally {
            setGeneratingQr(false)
        }
    }

    const handleLectureClick = async (lecture) => {
        if (expandedLecture === lecture.id) {
            // Collapse if already expanded
            setExpandedLecture(null)
        } else {
            // Expand and generate QR code
            setExpandedLecture(lecture.id)
            await generateQRCode(lecture)
        }
    }

    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr)
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date)
    }

    const getLectureStatus = (scheduledAt) => {
        const now = new Date()
        const lectureStart = new Date(scheduledAt)
        const attendanceDeadline = new Date(lectureStart.getTime() + 30 * 60 * 1000) // 30 minutes after start

        if (now < lectureStart) {
            return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' }
        } else if (now >= lectureStart && now <= attendanceDeadline) {
            return { status: 'active', color: 'bg-green-100 text-green-800' }
        } else {
            return { status: 'closed', color: 'bg-gray-100 text-gray-800' }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Lectures...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Lectures Record</h1>
                <p className="text-gray-600 mt-2">Click on any lecture to view its QR code</p>
            </div>

            {lectures.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-600 text-lg">No lectures found</p>
                    <p className="text-gray-500 text-sm mt-2">Lectures you create will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {lectures.map((lecture) => {
                        const isExpanded = expandedLecture === lecture.id
                        const lectureStatus = getLectureStatus(lecture.scheduled_at)

                        return (
                            <div
                                key={lecture.id}
                                className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Lecture Header - Clickable */}
                                <div
                                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => handleLectureClick(lecture)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    {lecture.topic}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${lectureStatus.color}`}>
                                                    {lectureStatus.status}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-600">
                                                <p>{lecture.course?.course_code} - {lecture.course?.course_title}</p>
                                                <p className="mt-1">{formatDateTime(lecture.scheduled_at)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            {isExpanded ? (
                                                <>
                                                    <EyeOff className="w-4 h-4 text-gray-500" />
                                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-4 h-4 text-gray-500" />
                                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded QR Code Section */}
                                {isExpanded && (
                                    <div className="border-t bg-gray-50 p-6">
                                        <div className="text-center">
                                            <h4 className="font-medium text-gray-900 mb-4">
                                                QR Code for Attendance
                                            </h4>

                                            {generatingQr ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                                                    <span className="text-gray-600">Generating QR Code...</span>
                                                </div>
                                            ) : qrCodes[lecture.id] ? (
                                                <div className="inline-block">
                                                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                                                        <img
                                                            src={qrCodes[lecture.id]}
                                                            alt={`QR Code for ${lecture.topic}`}
                                                            className="mx-auto"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-3">
                                                        Students can scan this QR code to mark their attendance
                                                    </p>
                                                    {lectureStatus.status === 'active' && (
                                                        <p className="text-xs text-green-600 font-medium mt-1">
                                                            ✓ Currently accepting attendance
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-red-500">Failed to generate QR code</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}