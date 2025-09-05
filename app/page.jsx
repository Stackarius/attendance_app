"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { QrCode, BarChart3, CheckCircle } from "lucide-react";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import DashboardPreview from "@/component/Preview";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 text-white">
      <Header />

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-20 relative">
        <h2 className="mt-10 md:mt-25 text-5xl md:text-6xl font-extrabold leading-tight">
          Attendance, <span className="text-yellow-300">Reimagined</span>.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-gray-200">
          Say goodbye to roll calls. Manage attendance effortlessly with QR
          codes, real-time dashboards, and instant reports.
        </p>
        <Link
          href="/auth/login"
          className="mt-8 inline-block px-8 py-4 bg-yellow-400 text-blue-900 rounded-full font-bold text-lg shadow-2xl hover:bg-yellow-300 hover:scale-105 transition"
        >
          Try Free Today 🚀
        </Link>

        <DashboardPreview />
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white text-gray-800 relative -skew-y-2">
        <div className="max-w-6xl mx-auto px-6 skew-y-2">
          <h3 className="text-4xl font-bold text-center mb-14">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: "1",
                title: "Generate QR Code",
                desc: "Lecturers generate a unique QR code for each class.",
              },
              {
                step: "2",
                title: "Students Scan",
                desc: "Students scan the code with their phone to mark attendance.",
              },
              {
                step: "3",
                title: "Track in Real Time",
                desc: "Attendance instantly reflects on the lecturer dashboard.",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-white shadow-xl text-center"
              >
                <div className="text-5xl font-extrabold text-blue-600">
                  {s.step}
                </div>
                <h4 className="mt-4 text-xl font-semibold">{s.title}</h4>
                <p className="mt-2 text-gray-600">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 text-gray-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold mb-14">Powerful Features</h3>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <QrCode size={36} />,
                title: "QR Code Check-in",
                desc: "Students scan codes to mark attendance instantly.",
              },
              {
                icon: <BarChart3 size={36} />,
                title: "Real-Time Dashboard",
                desc: "Lecturers see live stats and trends instantly.",
              },
              {
                icon: <CheckCircle size={36} />,
                title: "Reports & Analytics",
                desc: "Download detailed summaries with one click.",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="p-8 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl"
              >
                <div className="flex justify-center text-yellow-300">{f.icon}</div>
                <h4 className="mt-4 text-xl font-semibold">{f.title}</h4>
                <p className="mt-2 text-gray-200">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white text-gray-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold mb-14">What Students & Lecturers Say</h3>
          <div className="grid md:grid-cols-2 gap-10">
            {[
              {
                quote:
                  "AttendEase has made attendance seamless. No more wasting 10 minutes calling names!",
                name: "Mr. Ade, Lecturer",
              },
              {
                quote:
                  "I love how quick it is to check in. Plus, I can see my attendance record anytime.",
                name: "Chioma, Student",
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.3 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-gray-50 shadow-lg"
              >
                <p className="italic text-gray-700">“{t.quote}”</p>
                <h5 className="mt-4 font-semibold text-blue-600">{t.name}</h5>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-700 to-indigo-800 text-center">
        <h3 className="text-3xl font-bold">Ready to modernize attendance?</h3>
        <Link
          href="/auth/signup"
          className="mt-6 inline-block px-8 py-4 bg-yellow-400 text-blue-900 rounded-full font-bold text-lg shadow-2xl hover:bg-yellow-300 hover:scale-105 transition"
        >
          Get Started Free 🚀
        </Link>
      </section>

      <Footer />

    </main>
  );
}
