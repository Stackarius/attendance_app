"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const QrReader = dynamic(() => import("react-qr-scanner"), { ssr: false });

export default function AttendanceScanner({ sessionId }) {
    const [scanResult, setScanResult] = useState("");

    const handleScan = async (data) => {
        if (data) {
            setScanResult(data);

            // send attendance record to Supabase
            await fetch("/api/mark-attendance", {
                method: "POST",
                body: JSON.stringify({ sessionId, qrData: data }),
                headers: { "Content-Type": "application/json" },
            });
        }
    };

    return (
        <div>
            <h2>Scan Student QR</h2>
            <QrReader delay={300} onError={console.error} onScan={handleScan} style={{ width: "100%" }} />
            <p>Last scan: {scanResult}</p>
        </div>
    );
}
