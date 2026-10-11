
"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
    ArrowRight,
    CalendarDays,
    Clock3,
    RefreshCw,
    Stethoscope,
    Users,
    HeartPulse,
    CheckCircle2,
    Activity,
    CalendarPlus2,
} from "lucide-react";


import { patientService } from "@/services/patientService";
import type { Appointment } from "@/types/appointment";

const STATUS_LABELS: Record<string, string> = {
    BOOKED: "Booked",
    CONFIRMED: "Confirmed",
    CHECKED_IN: "Checked In",
    IN_QUEUE: "Waiting in Queue",
    IN_CONSULTATION: "In Consultation",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
};

const STATUS_STYLES: Record<string, string> = {
    BOOKED: "bg-blue-50 text-blue-700",
    CONFIRMED: "bg-indigo-50 text-indigo-700",
    CHECKED_IN: "bg-amber-50 text-amber-700",
    IN_QUEUE: "bg-violet-50 text-violet-700",
    IN_CONSULTATION: "bg-cyan-50 text-cyan-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-red-50 text-red-700",
};

function formatDateTime(value: string) {
    return new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export default function PatientDashboard() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        let active = true;
        let inFlight = false;

        const loadAppointments = async () => {
            if (inFlight) return;

            inFlight = true;

            try {
                const data = await patientService.getMyAppointments();

                if (active) {
                    setAppointments(data);
                    setError("");
                }
            } catch (err) {
                if (active) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load appointments."
                    );
                }
            } finally {
                inFlight = false;

                if (active) {
                    setLoading(false);
                }
            }
        };

        // Initial API call
        void loadAppointments();

        // Background refresh every 10 seconds
        const intervalId = window.setInterval(() => {
            void loadAppointments();
        }, 10000);

        return () => {
            active = false;
            window.clearInterval(intervalId);
        };
    }, []);

    const refreshAppointments = async () => {
        if (refreshing) return;

        try {
            setRefreshing(true);

            const data = await patientService.getMyAppointments();

            setAppointments(data);
            setError("");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to refresh appointments."
            );
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    const activeAppointments = appointments.filter(
        (appointment) =>
            appointment.status !== "COMPLETED" &&
            appointment.status !== "CANCELLED"
    );

    const completedAppointments = appointments.filter(
        (appointment) => appointment.status === "COMPLETED"
    );

    const stats = [
        {
            title: "Total Appointments",
            value: appointments.length,
            description: "All your booked appointments",
            icon: CalendarDays,
        },
        {
            title: "Active Appointments",
            value: activeAppointments.length,
            description: "Upcoming and ongoing visits",
            icon: Users,
        },
        {
            title: "Completed Visits",
            value: completedAppointments.length,
            description: "Successfully completed consultations",
            icon: CheckCircle2,
        },
    ];

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                    <p className="mt-4 text-sm text-slate-500">
                        Loading patient dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 text-slate-900 sm:p-6 xl:p-8">
            {/* WELCOME BANNER */}
            <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-blue-600/15 sm:p-8"
            >
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <p className="text-sm font-medium text-blue-100">
                            Patient Portal
                        </p>

                        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                            Welcome to MediCare
                        </h1>

                        <p className="mt-3 max-w-xl text-sm text-blue-50">
                            Manage your appointments, track your queue number,
                            and stay updated on your consultation status.
                        </p>
                    </div>

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                        <HeartPulse className="h-8 w-8" />
                    </div>
                </div>
            </motion.section>

            {/* Booking Appointment */}
            {/* Booking Appointment */}
            <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Link
                    href="/patient/book-appointment"
                    className="group flex flex-col gap-5 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 transition-all duration-300 hover:border-blue-400 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
                            <CalendarPlus2 className="h-7 w-7" />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Book New Appointment
                            </h3>

                            <p className="mt-1 text-sm font-medium text-slate-700">
                                Find doctors, check available slots and book your appointment.
                            </p>
                        </div>
                    </div>

                    <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-blue-700">
      Book Appointment
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </span>
                </Link>
            </motion.section>


            {/* ERROR */}
            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    {error}
                </div>
            )}



            {/* STATS */}
            <section className="grid gap-4 md:grid-cols-3">
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

            {/* LIVE QUEUE */}
            <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-bold text-slate-950">
                                Live Queue Tracking
                            </h2>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Track your active appointments and consultation status.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void refreshAppointments()}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                refreshing ? "animate-spin" : ""
                            }`}
                        />
                        Refresh
                    </button>
                </div>

                {activeAppointments.length === 0 ? (
                    <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                        <Users className="mx-auto h-9 w-9 text-slate-300" />
                        <p className="mt-3 text-sm font-medium text-slate-600">
                            No active appointments found.
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 grid gap-4 xl:grid-cols-2">
                        {activeAppointments.map((appointment) => (
                            <div
                                key={appointment.id}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition-colors hover:border-blue-200"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-400">
                                            Appointment #{appointment.id}
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">
                                            <Stethoscope className="h-4 w-4 text-blue-600" />
                                            <h3 className="font-bold text-slate-900">
                                                {appointment.doctor?.name ?? "Doctor"}
                                            </h3>
                                        </div>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {appointment.doctor?.specialization ?? ""}
                                        </p>
                                    </div>

                                    <div className="shrink-0 rounded-xl bg-blue-100 px-4 py-3 text-center">
                                        <p className="text-xs font-medium text-blue-700">
                                            Queue No.
                                        </p>

                                        <p className="mt-1 text-2xl font-bold text-blue-700">
                                            #{appointment.queueNumber ?? "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
                                    <Clock3 className="h-4 w-4 text-blue-600" />
                                    {formatDateTime(appointment.appointmentTime)}
                                </div>

                                <div className="mt-4">
                  <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          STATUS_STYLES[appointment.status] ??
                          "bg-slate-100 text-slate-600"
                      }`}
                  >
                    {STATUS_LABELS[appointment.status] ??
                        appointment.status}
                  </span>
                                </div>

                                <p className="mt-4 border-t border-slate-200 pt-3 text-sm text-slate-500">
                                    {appointment.reason}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <p className="mt-5 text-xs text-slate-400">
                    Status refreshes automatically every 10 seconds.
                    Queue numbers are assigned per appointment slot.
                </p>
            </motion.section>

            {/* APPOINTMENT HISTORY */}
            <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-slate-950">
                        Appointment History
                    </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                    Your previous completed consultations.
                </p>

                {completedAppointments.length === 0 ? (
                    <p className="mt-6 text-sm text-slate-500">
                        No completed appointments yet.
                    </p>
                ) : (
                    <div className="mt-6 space-y-3">
                        {completedAppointments.map((appointment) => (
                            <div
                                key={appointment.id}
                                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
                            >
                                <div>
                                    <p className="font-semibold text-slate-900">
                                        {appointment.doctor?.name ?? "Doctor"}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {formatDateTime(appointment.appointmentTime)}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Appointment #{appointment.id}
                                    </p>
                                </div>

                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Completed
                </span>
                            </div>
                        ))}
                    </div>
                )}
            </motion.section>
        </div>
    );
}
