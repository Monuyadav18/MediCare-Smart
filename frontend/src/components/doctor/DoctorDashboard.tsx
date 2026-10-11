
"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
    CalendarDays,
    Clock3,
    Stethoscope,
    Users,
    ArrowRight,
    RefreshCw,
} from "lucide-react";

import { doctorService } from "@/services/doctorService";
import { appointmentService } from "@/services/appointmentService";
import type { DoctorDashboardSummary } from "@/types/doctor";
import type {
    Appointment,
    AppointmentStatus,
} from "@/types/appointment";

export default function DoctorDashboard() {
    const [dashboard, setDashboard] =
        useState<DoctorDashboardSummary | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // LIVE QUEUE
    const [queue, setQueue] = useState<Appointment[]>([]);
    const [queueDate, setQueueDate] = useState(() => {
        const now = new Date();
        const localDate = new Date(
            now.getTime() - now.getTimezoneOffset() * 60000
        );
        return localDate.toISOString().slice(0, 10);
    });
    const [queueLoading, setQueueLoading] = useState(false);
    const [queueError, setQueueError] = useState("");
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    // =========================================================
    // LOAD DASHBOARD
    // =========================================================

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await doctorService.getDashboardSummary();

            setDashboard(data);
        } catch (err) {
            console.error("Doctor Dashboard API Error:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load doctor dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LOAD LIVE QUEUE
    // =========================================================

    const loadQueue = async (
        date: string,
        background = false
    ) => {
        try {
            if (!background) {
                setQueueLoading(true);
            }

            setQueueError("");

            const data = await doctorService.getLiveQueue(date);
            setQueue(data);

        } catch (err) {
            setQueueError(
                err instanceof Error
                    ? err.message
                    : "Unable to load patient queue."
            );
        } finally {
            if (!background) {
                setQueueLoading(false);
            }
        }
    };

    // =========================================================
    // UPDATE QUEUE STATUS
    // =========================================================

    const handleQueueStatusUpdate = async (
        appointmentId: number,
        status: AppointmentStatus
    ) => {
        try {
            setUpdatingId(appointmentId);
            setQueueError("");

            await appointmentService.updateAppointmentStatus(
                appointmentId,
                status
            );

            await Promise.all([
                loadQueue(queueDate),
                loadDashboard(),
            ]);
        } catch (err) {
            setQueueError(
                err instanceof Error
                    ? err.message
                    : "Unable to update appointment status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // =========================================================
    // INITIAL API CALLS
    // =========================================================

    useEffect(() => {
        void loadDashboard();
    }, []);

    useEffect(() => {
        // Initial load
        void loadQueue(queueDate);

        // Background refresh every 10 seconds
        const intervalId = window.setInterval(() => {
            void loadQueue(queueDate, true);
        }, 10000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [queueDate]);

    // =========================================================
    // LOADING
    // =========================================================

    if (loading && !dashboard) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                    <p className="mt-4 text-sm text-slate-500">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (!dashboard) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                    <p className="font-semibold text-red-600">
                        Unable to load dashboard
                    </p>

                    <p className="mt-2 text-sm text-red-500">
                        {error}
                    </p>

                    <button
                        onClick={() => void loadDashboard()}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: "Today's Appointments",
            value: dashboard.todayAppointments,
            icon: CalendarDays,
            description: "Scheduled for today",
        },
        {
            title: "Active Queue",
            value: dashboard.activeQueue,
            icon: Users,
            description: "Patients in active queue",
        },
        {
            title: "Today's Slots",
            value: dashboard.todaySlots,
            icon: Clock3,
            description: "Available schedule slots",
        },
    ];

    return (
        <div className="p-4 sm:p-6 xl:p-8">

            {/* ================================================= */}
            {/* WELCOME SECTION */}
            {/* ================================================= */}

            <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-blue-600/15 sm:p-8"
            >
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <p className="text-sm font-medium text-blue-100">
                            Doctor Dashboard
                        </p>

                        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                            Welcome, {dashboard.name}
                        </h1>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-blue-50">
                            <span className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4" />
                                {dashboard.specialization}
                            </span>

                            <span className="hidden sm:inline">•</span>

                            <span>{dashboard.email}</span>
                        </div>
                    </div>

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                        <Stethoscope className="h-8 w-8" />
                    </div>
                </div>
            </motion.section>

            {/* ================================================= */}
            {/* DASHBOARD STATS */}
            {/* ================================================= */}

            <section className="mt-6 grid gap-4 md:grid-cols-3">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;

                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            whileHover={{ y: -4 }}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        {stat.title}
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-slate-950">
                                        {stat.value}
                                    </p>
                                </div>

                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>

                            <p className="mt-4 text-xs text-slate-400">
                                {stat.description}
                            </p>
                        </motion.div>
                    );
                })}
            </section>

            {/* ================================================= */}
            {/* QUICK ACTIONS + TODAY OVERVIEW */}
            {/* ================================================= */}

            <section className="mt-6 grid gap-6 lg:grid-cols-2">

                {/* QUICK ACTIONS */}

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                    <h2 className="text-lg font-bold text-slate-950">
                        Quick Actions
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Manage your daily hospital activities.
                    </p>

                    <div className="mt-5 space-y-3">
                        <Link
                            href="/doctor/availability"
                            className="group flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-all hover:border-blue-200 hover:bg-blue-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Clock3 className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Manage Availability
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Create and manage appointment slots
                                    </p>
                                </div>
                            </div>

                            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                        </Link>

                        <Link
                            href="/doctor/appointments"
                            className="group flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-all hover:border-blue-200 hover:bg-blue-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                                    <CalendarDays className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        View Appointments
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Review scheduled patient appointments
                                    </p>
                                </div>
                            </div>

                            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                        </Link>
                    </div>
                </motion.div>

                {/* TODAY'S OVERVIEW */}

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32 }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                    <h2 className="text-lg font-bold text-slate-950">
                        Today&apos;s Overview
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Your current schedule summary.
                    </p>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <span className="text-sm text-slate-500">
                                Appointments
                            </span>
                            <span className="font-bold text-slate-900">
                                {dashboard.todayAppointments}
                            </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <span className="text-sm text-slate-500">
                                Active Queue
                            </span>
                            <span className="font-bold text-slate-900">
                                {dashboard.activeQueue}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">
                                Schedule Slots
                            </span>
                            <span className="font-bold text-slate-900">
                                {dashboard.todaySlots}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ================================================= */}
            {/* LIVE PATIENT QUEUE */}
            {/* ================================================= */}

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                {/* HEADER */}

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-950">
                            Live Patient Queue
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Checked-in patients and ongoing consultations
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="date"
                            value={queueDate}
                            onChange={(e) => setQueueDate(e.target.value)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        />

                        <button
                            onClick={() => void loadQueue(queueDate)}
                            disabled={queueLoading || updatingId !== null}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${queueLoading ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* QUEUE ERROR */}

                {queueError && (
                    <p
                        role="alert"
                        className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600"
                    >
                        {queueError}
                    </p>
                )}

                {/* QUEUE LOADING */}

                {queueLoading ? (
                    <p className="mt-6 text-sm text-slate-500">
                        Loading patient queue...
                    </p>
                ) : queue.length === 0 ? (
                    <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                        <Users className="mx-auto h-9 w-9 text-slate-300" />

                        <p className="mt-3 text-sm font-medium text-slate-600">
                            {queueError
                                ? "Unable to load queue."
                                : "No active patients in the queue for this date."}
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 space-y-3">
                        {queue.map((appointment) => (
                            <div
                                key={appointment.id}
                                className={`rounded-xl border p-4 transition-colors ${
                                    appointment.status === "IN_CONSULTATION"
                                        ? "border-blue-300 bg-blue-50"
                                        : "border-slate-200 bg-slate-50"
                                }`}
                            >
                                <div className="flex flex-wrap items-center justify-between gap-4">

                                    {/* PATIENT DETAILS */}

                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white font-bold text-blue-600 shadow-sm">
                                            {appointment.queueNumber}
                                        </div>

                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                {appointment.patient.name}
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {appointment.reason}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Appointment #{appointment.id}
                                                {" • "}
                                                {new Date(
                                                    appointment.appointmentTime
                                                ).toLocaleTimeString("en-IN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* STATUS + ACTION BUTTONS */}

                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                            {appointment.status.replaceAll("_", " ")}
                                        </span>

                                        {appointment.status === "CHECKED_IN" && (
                                            <button
                                                disabled={updatingId !== null}
                                                onClick={() =>
                                                    void handleQueueStatusUpdate(
                                                        appointment.id,
                                                        "IN_QUEUE"
                                                    )
                                                }
                                                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {updatingId === appointment.id
                                                    ? "Updating..."
                                                    : "Add to Queue"}
                                            </button>
                                        )}

                                        {appointment.status === "IN_QUEUE" && (
                                            <button
                                                disabled={updatingId !== null}
                                                onClick={() =>
                                                    void handleQueueStatusUpdate(
                                                        appointment.id,
                                                        "IN_CONSULTATION"
                                                    )
                                                }
                                                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                {updatingId === appointment.id
                                                    ? "Updating..."
                                                    : "Start Consultation"}
                                            </button>
                                        )}

                                        {appointment.status === "IN_CONSULTATION" && (
                                            <button
                                                disabled={updatingId !== null}
                                                onClick={() =>
                                                    void handleQueueStatusUpdate(
                                                        appointment.id,
                                                        "COMPLETED"
                                                    )
                                                }
                                                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                {updatingId === appointment.id
                                                    ? "Updating..."
                                                    : "Complete Consultation"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
