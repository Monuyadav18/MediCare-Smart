"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
    Activity,
    ArrowUpRight,
    CalendarDays,
    Clock3,
    Plus,
    RefreshCw,
    Stethoscope,
    UserPlus,
    Users,
} from "lucide-react";

import { adminService } from "@/services/adminService";
import { AdminDashboardSummary } from "@/types/admin";


export default function AdminDashboard() {
    const [dashboard, setDashboard] =
        useState<AdminDashboardSummary | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await adminService.getDashboardSummary();

            setDashboard(data);
        } catch (err) {
            console.error("Dashboard API Error:", err);

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Unable to load dashboard.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const stats = [
        {
            title: "Total Doctors",
            value: dashboard?.totalDoctors ?? 0,
            description: "Registered doctors",
            icon: Stethoscope,
        },
        {
            title: "Total Patients",
            value: dashboard?.totalPatients ?? 0,
            description: "Registered patients",
            icon: Users,
        },
        {
            title: "Appointments",
            value: dashboard?.totalAppointments ?? 0,
            description: "Total appointments",
            icon: CalendarDays,
        },
        {
            title: "Active Queue",
            value: dashboard?.activeQueue ?? 0,
            description: "Patients currently in queue",
            icon: Activity,
        },
    ];

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                    <p className="mt-4 text-sm font-medium text-slate-500">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                    <p className="font-semibold text-red-600">
                        Unable to load dashboard
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                        {error}
                    </p>

                    <button
                        onClick={loadDashboard}
                        className="mx-auto mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Welcome */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
            >
                <div>
                    <p className="text-sm font-semibold text-blue-600">
                        ADMIN OVERVIEW
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        Welcome back, Admin
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Here&apos;s what&apos;s happening with MediCare today.
                    </p>
                </div>

                <button className="group flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700">
                    <UserPlus className="h-4 w-4" />
                    Onboard Doctor
                </button>
            </motion.div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;

                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: index * 0.08,
                            }}
                            whileHover={{ y: -5 }}
                            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 transition-colors group-hover:bg-blue-600">
                                    <Icon className="h-5 w-5 text-blue-600 transition-colors group-hover:text-white" />
                                </div>

                                <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-blue-600" />
                            </div>

                            <p className="mt-5 text-sm font-medium text-slate-500">
                                {stat.title}
                            </p>

                            <p className="mt-1 text-3xl font-bold text-slate-950">
                                {stat.value}
                            </p>

                            <p className="mt-2 text-xs text-slate-400">
                                {stat.description}
                            </p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Main grid */}
            <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                {/* Recent appointments */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    <div className="flex items-center justify-between border-b border-slate-100 p-5">
                        <div>
                            <h2 className="font-bold text-slate-900">
                                Recent Appointments
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Latest patient bookings
                            </p>
                        </div>

                        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                            View all
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px]">
                            <thead>
                            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400">
                                <th className="px-5 py-4 font-semibold">
                                    Patient
                                </th>
                                <th className="px-5 py-4 font-semibold">
                                    Doctor
                                </th>
                                <th className="px-5 py-4 font-semibold">
                                    Time
                                </th>
                                <th className="px-5 py-4 font-semibold">
                                    Queue
                                </th>
                                <th className="px-5 py-4 font-semibold">
                                    Status
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            <tr className="border-t border-slate-100 transition-colors hover:bg-slate-50">
                                <td className="px-5 py-5">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            Monu Yadav
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Knee consultation
                                        </p>
                                    </div>
                                </td>

                                <td className="px-5 py-5 text-sm text-slate-600">
                                    Dr. Amit Sharma
                                </td>

                                <td className="px-5 py-5">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Clock3 className="h-4 w-4 text-slate-400" />
                                        10:00 AM
                                    </div>
                                </td>

                                <td className="px-5 py-5">
                    <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-600">
                      #1
                    </span>
                                </td>

                                <td className="px-5 py-5">
                    <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600">
                      BOOKED
                    </span>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Quick actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32 }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                    <div>
                        <h2 className="font-bold text-slate-900">
                            Quick Actions
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            Common administration tasks
                        </p>
                    </div>

                    <div className="mt-5 space-y-3">
                        <button className="group flex w-full items-center gap-4 rounded-xl border border-slate-100 p-4 text-left transition-all hover:border-blue-100 hover:bg-blue-50">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-600">
                                <UserPlus className="h-5 w-5 text-blue-600 group-hover:text-white" />
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">
                                    Onboard Doctor
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Register a new doctor
                                </p>
                            </div>

                            <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
                        </button>

                        <button className="group flex w-full items-center gap-4 rounded-xl border border-slate-100 p-4 text-left transition-all hover:border-blue-100 hover:bg-blue-50">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 group-hover:bg-cyan-600">
                                <Stethoscope className="h-5 w-5 text-cyan-600 group-hover:text-white" />
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">
                                    Manage Doctors
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    View hospital doctors
                                </p>
                            </div>

                            <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
                        </button>

                        <button className="group flex w-full items-center gap-4 rounded-xl border border-slate-100 p-4 text-left transition-all hover:border-blue-100 hover:bg-blue-50">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 group-hover:bg-violet-600">
                                <CalendarDays className="h-5 w-5 text-violet-600 group-hover:text-white" />
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">
                                    Appointments
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Monitor bookings
                                </p>
                            </div>

                            <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
                        </button>
                    </div>

                    <div className="mt-5 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-blue-100">
                                    SYSTEM STATUS
                                </p>

                                <p className="mt-1 font-bold">
                                    All systems operational
                                </p>
                            </div>

                            <div className="relative">
                                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-300 opacity-50" />
                                <span className="relative block h-3 w-3 rounded-full bg-emerald-300" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Bottom card */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            >
                <div>
                    <p className="font-bold text-slate-900">
                        Doctor management
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        Add doctors and manage their access to MediCare.
                    </p>
                </div>

                <button className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-50">
                    <Plus className="h-4 w-4" />
                    Add Doctor
                </button>
            </motion.div>
        </div>
    );
}