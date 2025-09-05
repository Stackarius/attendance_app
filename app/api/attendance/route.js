import { NextResponse } from "next/server"
import QRCode from "qrcode"

export async function POST(req) {
    try {
        const body = await req.json()
        const { classId, lecturerId, courseCode } = body
        
        // validate the inputs
        if (!classId || !lecturerId || !courseCode) {
            return NextResponse.json({
                success: false,
                message: "Class Id, Lecturer Id, and Course Code are required"
            }, {status: 400})
        }
        
        const now = Date.now()
        const expiryMinutes = 5

        const payload = {
            classId,
            lecturerId,
            courseCode,
            timestamp: now,
            expiresAt: now + expiryMinutes * 60 * 1000
        }

        // generate qr code
        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(payload))

        return NextResponse.json({
            success: true,
            qrCode: qrDataUrl,
            payload,
        });

    } catch (error) {
        console.log("QR generation failed", error)
        return NextResponse.json({
            success: false,
            message: "QR generation failed"
        }, {status: 500})
    }
}