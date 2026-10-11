"use client";

import { useEffect, useMemo,useRef, useState } from "react";

import {
    CalendarDays,
    Clock3,
    RefreshCw,
    Search,
    Stethoscope,
    UserRound,
    UsersRound,
} from "lucide-react";
import { motion } from "motion/react";

import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { appointmentService } from "@/services/appointmentService";
import type {
    Appointment,
    AppointmentStatus,
} from "@/types/appointment";

const statusStyles: Record<AppointmentStatus, string> = {
    BOOKED:
        "bg-blue-50 text-blue-700 ring-blue-600/20",

    CONFIRMED:
        "bg-indigo-50 text-indigo-700 ring-indigo-600/20",

    CHECKED_IN:
        "bg-amber-50 text-amber-700 ring-amber-600/20",

    IN_QUEUE:
        "bg-orange-50 text-orange-700 ring-orange-600/20",

    IN_CONSULTATION:
        "bg-purple-50 text-purple-700 ring-purple-600/20",

    COMPLETED:
        "bg-emerald-50 text-emerald-700 ring-emerald-600/20",

    CANCELLED:
        "bg-red-50 text-red-700 ring-red-600/20",

    NO_SHOW:
        "bg-slate-100 text-slate-600 ring-slate-500/20",

    RESCHEDULED:
        "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
};



const formatStatus = (
    status: AppointmentStatus
) => {
    return status
        .split("_")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1).toLowerCase()
        )
        .join(" ");
};


const formatTime = (
    value: string
) => {
    return new Date(value).toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};


const formatDate = (
    value: string
) => {
    return new Date(value).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


export default function DoctorAppointmentsPage() {

    // =========================================================
    // SIDEBAR STATE
    // =========================================================

    const [collapsed, setCollapsed] =
        useState(false);

    const [mobileOpen, setMobileOpen] =
        useState(false);


    // =========================================================
    // APPOINTMENT STATE
    // =========================================================

    const [appointments, setAppointments] =
        useState<Appointment[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [updatingId, setUpdatingId] =
        useState<number | null>(null);

    const updatingRef = useRef(false);
    const requestIdRef = useRef(0);

    // =========================================================
// UPDATE APPOINTMENT STATUS
// =========================================================

    const handleStatusUpdate = async (
        appointmentId: number,
        newStatus: AppointmentStatus
    ) => {
        if (updatingRef.current) return;

        updatingRef.current = true;
        requestIdRef.current += 1;

        try {
            setUpdatingId(appointmentId);
            setError("");

            const updated =
                await appointmentService.updateAppointmentStatus(
                    appointmentId,
                    newStatus
                );

            setAppointments((previous) =>
                previous.map((appointment) =>
                    appointment.id === appointmentId
                        ? updated
                        : appointment
                )
            );

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update appointment status"
            );
        } finally {
            updatingRef.current = false;
            setUpdatingId(null);
            setLoading(false);
        }
    };


    // =========================================================
    // FILTER STATE
    // =========================================================

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState<"ALL" | AppointmentStatus>(
            "ALL"
        );



    // =========================================================
    // LOAD DOCTOR APPOINTMENTS
    // =========================================================

    const loadAppointments = async (
        showLoading: boolean = true
    ) => {
        if (updatingRef.current) return;

        const requestId = ++requestIdRef.current;

        try {
            if (showLoading) {
                setLoading(true);
            }

            setError("");

            const data =
                await appointmentService.getDoctorAppointments();

            const statusPriority: Partial<Record<AppointmentStatus, number>> = {
                IN_CONSULTATION: 1,
                IN_QUEUE: 2,
                CHECKED_IN: 3,
                CONFIRMED: 4,
                BOOKED: 5,
                COMPLETED: 6,
                CANCELLED: 7,
                NO_SHOW: 8,
                RESCHEDULED: 9,
            };

            const sorted = [...data].sort((a, b) => {
                const priorityA = statusPriority[a.status] ?? 99;
                const priorityB = statusPriority[b.status] ?? 99;

                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }

                if (a.status === "IN_QUEUE" && b.status === "IN_QUEUE") {
                    const queueA = a.queueNumber ?? Number.MAX_SAFE_INTEGER;
                    const queueB = b.queueNumber ?? Number.MAX_SAFE_INTEGER;

                    if (queueA !== queueB) {
                        return queueA - queueB;
                    }
                }

                return (
                    new Date(a.appointmentTime).getTime() -
                    new Date(b.appointmentTime).getTime()
                );
            });

            if (
                requestId === requestIdRef.current &&
                !updatingRef.current
            ) {
                setAppointments(sorted);
            }

        } catch (err) {
            console.error("Doctor appointments error:", err);

            if (
                requestId === requestIdRef.current &&
                !updatingRef.current
            ) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load appointments."
                );
            }

        } finally {
            if (
                showLoading &&
                requestId === requestIdRef.current
            ) {
                setLoading(false);
            }
        }
    };


    // =========================================================
    // LOAD WHEN PAGE OPENS
    // =========================================================

    useEffect(() => {
        void loadAppointments(true);

        const interval = window.setInterval(() => {
            void loadAppointments(false);
        }, 10000);

        return () => {
            window.clearInterval(interval);
        };
    }, []);


    // =========================================================
    // SEARCH + STATUS FILTER
    // =========================================================

    const filteredAppointments =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();


            return appointments.filter(
                (appointment) => {

                    const patientName =
                        appointment.patient?.name
                            ?.toLowerCase() ?? "";

                    const reason =
                        appointment.reason
                            ?.toLowerCase() ?? "";

                    const queue =
                        String(
                            appointment.queueNumber ??
                            ""
                        );


                    const matchesSearch =
                        !query ||
                        patientName.includes(query) ||
                        reason.includes(query) ||
                        queue.includes(query);


                    const matchesStatus =
                        statusFilter === "ALL" ||
                        appointment.status ===
                        statusFilter;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );

        }, [
            appointments,
            search,
            statusFilter,
        ]);


    // =========================================================
    // DASHBOARD COUNTS
    // =========================================================

    const activeQueue =
        appointments.filter(
            (appointment) =>
                [
                    "CHECKED_IN",
                    "IN_QUEUE",
                    "IN_CONSULTATION",
                ].includes(
                    appointment.status
                )
        ).length;


    const bookedCount =
        appointments.filter(
            (appointment) =>
                appointment.status ===
                "BOOKED" ||
                appointment.status ===
                "CONFIRMED"
        ).length;

    // =========================================================
// LIVE QUEUE DASHBOARD
// =========================================================

    const today = new Date().toDateString();

    const todayAppointments = appointments.filter(
        (appointment) =>
            new Date(appointment.appointmentTime).toDateString() === today
    );

    const consultingPatients = todayAppointments.filter(
        (appointment) =>
            appointment.status === "IN_CONSULTATION"
    );

    const waitingPatients = todayAppointments
        .filter(
            (appointment) =>
                appointment.status === "IN_QUEUE"
        )
        .sort(
            (a, b) =>
                (a.queueNumber ?? Number.MAX_SAFE_INTEGER) -
                (b.queueNumber ?? Number.MAX_SAFE_INTEGER)
        );

    const checkedInPatients = todayAppointments.filter(
        (appointment) =>
            appointment.status === "CHECKED_IN"
    );

    const nextPatient = waitingPatients[0] ?? null;


    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="min-h-screen bg-slate-50">

            {/* ===============================================
                SIDEBAR
            =============================================== */}

            <DashboardSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />


            {/* ===============================================
                MAIN CONTENT
            =============================================== */}

            <main
                className={`min-h-screen transition-all duration-300 ${
                    collapsed
                        ? "lg:pl-20"
                        : "lg:pl-72"
                }`}
            >

                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">


                    {/* =========================================
                        HEADER
                    ========================================= */}

                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <p className="text-sm font-semibold text-blue-600">
                                Doctor Portal
                            </p>

                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Appointments & Queue
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                View your patients,
                                appointment schedule and
                                queue.
                            </p>

                        </div>


                        {/* Refresh Button */}

                        <button
                            type="button"
                            onClick={() => void loadAppointments(true)}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
                        >

                            <RefreshCw
                                className={`h-4 w-4 ${
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }`}
                            />

                            Refresh

                        </button>

                    </div>


                    {/* =========================================
                        STAT CARDS
                    ========================================= */}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                        <StatCard
                            title="Total Appointments"
                            value={
                                appointments.length
                            }
                            icon={
                                <CalendarDays className="h-5 w-5" />
                            }
                        />


                        <StatCard
                            title="Booked / Confirmed"
                            value={
                                bookedCount
                            }
                            icon={
                                <UsersRound className="h-5 w-5" />
                            }
                        />


                        <StatCard
                            title="Active Queue"
                            value={
                                activeQueue
                            }
                            icon={
                                <Stethoscope className="h-5 w-5" />
                            }
                        />

                    </div>

                    {/* LIVE QUEUE DASHBOARD */}

                    <div className="mt-6 grid gap-4 lg:grid-cols-3">

                        {/* CURRENTLY CONSULTING */}
                        <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2 text-purple-700">
                                <Stethoscope className="h-5 w-5" />
                                <h3 className="font-bold">Currently Consulting</h3>
                            </div>

                            <p className="mt-4 text-3xl font-bold text-slate-900">
                                {consultingPatients.length}
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-700">
                                {consultingPatients.length > 0
                                    ? consultingPatients
                                        .map((patient) => patient.patient?.name ?? "Unknown Patient")
                                        .join(", ")
                                    : "No patient in consultation"}
                            </p>
                        </div>

                        {/* WAITING PATIENTS */}
                        <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2 text-orange-700">
                                <UsersRound className="h-5 w-5" />
                                <h3 className="font-bold">Waiting Patients</h3>
                            </div>

                            <p className="mt-4 text-3xl font-bold text-slate-900">
                                {waitingPatients.length}
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-700">
                                {checkedInPatients.length} checked in, awaiting queue entry
                            </p>
                        </div>

                        {/* NEXT PATIENT */}
                        <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2 text-blue-700">
                                <UserRound className="h-5 w-5" />
                                <h3 className="font-bold">Next Patient</h3>
                            </div>

                            {nextPatient ? (
                                <>
                                    <p className="mt-4 text-xl font-bold text-slate-900">
                                        {nextPatient.patient?.name ?? "Unknown Patient"}
                                    </p>

                                    <p className="mt-2 text-sm font-semibold text-blue-700">
                                        Queue #{nextPatient.queueNumber ?? "—"}
                                    </p>

                                    <button
                                        type="button"
                                        disabled={
                                            updatingId !== null ||
                                            consultingPatients.length > 0
                                        }
                                        onClick={() =>
                                            void handleStatusUpdate(
                                                nextPatient.id,
                                                "IN_CONSULTATION"
                                            )
                                        }
                                        className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {updatingId === nextPatient.id
                                            ? "Starting..."
                                            : consultingPatients.length > 0
                                                ? "Consultation In Progress"
                                                : "Start Next Consultation"}
                                    </button>
                                </>
                            ) : (
                                <p className="mt-4 text-sm font-medium text-slate-700">
                                    No patient waiting in queue
                                </p>
                            )}
                        </div>

                    </div>


                    {/* =========================================
                        SEARCH + FILTER
                    ========================================= */}

                    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                        <div className="flex flex-col gap-3 md:flex-row">


                            {/* Search */}

                            <div className="relative flex-1">

                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(
                                        event
                                    ) =>
                                        setSearch(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Search patient, reason or queue number..."
                                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                />

                            </div>


                            {/* Status Filter */}

                            <select
                                value={
                                    statusFilter
                                }
                                onChange={(
                                    event
                                ) =>
                                    setStatusFilter(
                                        event
                                            .target
                                            .value as
                                            | "ALL"
                                            | AppointmentStatus
                                    )
                                }
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
                            >

                                <option value="ALL">
                                    All Status
                                </option>

                                <option value="BOOKED">
                                    Booked
                                </option>

                                <option value="CONFIRMED">
                                    Confirmed
                                </option>

                                <option value="CHECKED_IN">
                                    Checked In
                                </option>

                                <option value="IN_QUEUE">
                                    In Queue
                                </option>

                                <option value="IN_CONSULTATION">
                                    In Consultation
                                </option>

                                <option value="COMPLETED">
                                    Completed
                                </option>

                                <option value="CANCELLED">
                                    Cancelled
                                </option>

                                <option value="NO_SHOW">
                                    No Show
                                </option>

                                <option value="RESCHEDULED">
                                    Rescheduled
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* =========================================
                        ERROR
                    ========================================= */}

                    {error && (

                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">

                            {error}

                        </div>

                    )}


                    {/* =========================================
                        LOADING
                    ========================================= */}

                    {loading && (

                        <div className="mt-6 flex min-h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white">

                            <div className="text-center">

                                <RefreshCw className="mx-auto h-7 w-7 animate-spin text-blue-600" />

                                <p className="mt-3 text-sm font-medium text-slate-500">
                                    Loading appointments...
                                </p>

                            </div>

                        </div>

                    )}


                    {/* =========================================
                        EMPTY STATE
                    ========================================= */}

                    {!loading &&
                        !error &&
                        filteredAppointments
                            .length === 0 && (

                            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

                                <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

                                <h2 className="mt-4 font-semibold text-slate-900">
                                    No appointments found
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Appointments matching
                                    your filters will appear
                                    here.
                                </p>

                            </div>

                        )}


                    {/* =========================================
                        APPOINTMENT LIST
                    ========================================= */}

                    {!loading &&
                        !error &&
                        filteredAppointments
                            .length > 0 && (

                            <div className="mt-6 space-y-4">

                                {filteredAppointments.map(
                                    (
                                        appointment,
                                        index
                                    ) => (

                                        <motion.div
                                            key={
                                                appointment.id
                                            }
                                            initial={{
                                                opacity: 0,
                                                y: 12,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            transition={{
                                                delay:
                                                    index *
                                                    0.05,
                                            }}
                                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                                        >

                                            <div className="p-5 sm:p-6">

                                                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">


                                                    {/* =====================
                                                        PATIENT INFORMATION
                                                    ====================== */}

                                                    <div className="flex min-w-0 items-start gap-4">

                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                                                            <UserRound className="h-6 w-6" />

                                                        </div>


                                                        <div className="min-w-0">

                                                            <div className="flex flex-wrap items-center gap-2">

                                                                <h2 className="font-bold text-slate-900">

                                                                    {
                                                                        appointment
                                                                            .patient
                                                                            ?.name ??
                                                                        "Unknown Patient"
                                                                    }

                                                                </h2>


                                                                {/* Status */}

                                                                <span
                                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                                                                        statusStyles[
                                                                            appointment
                                                                                .status
                                                                            ]
                                                                    }`}
                                                                >

                                                                    {formatStatus(
                                                                        appointment.status
                                                                    )}

                                                                </span>

                                                            </div>


                                                            {/* Reason */}

                                                            <p className="mt-1 text-sm text-slate-500">

                                                                {
                                                                    appointment.reason ||
                                                                    "No reason provided"
                                                                }

                                                            </p>


                                                            {/* Patient Details */}

                                                            <div className="mt-2 flex flex-wrap gap-2">

                                                                {appointment
                                                                    .patient
                                                                    ?.gender && (

                                                                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">

                                                                        Gender:{" "}
                                                                        {
                                                                            appointment
                                                                                .patient
                                                                                .gender
                                                                        }

                                                                    </span>

                                                                )}


                                                                {appointment
                                                                    .patient
                                                                    ?.bloodGroup && (

                                                                    <span className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600">

                                                                        Blood:{" "}
                                                                        {
                                                                            appointment
                                                                                .patient
                                                                                .bloodGroup
                                                                        }

                                                                    </span>

                                                                )}

                                                            </div>


                                                            {/* Date / Time */}

                                                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">

                                                                <span className="inline-flex items-center gap-1.5">

                                                                    <CalendarDays className="h-4 w-4 text-slate-400" />

                                                                    {formatDate(
                                                                        appointment.appointmentTime
                                                                    )}

                                                                </span>


                                                                <span className="inline-flex items-center gap-1.5">

                                                                    <Clock3 className="h-4 w-4 text-slate-400" />

                                                                    {formatTime(
                                                                        appointment.appointmentTime
                                                                    )}

                                                                </span>

                                                            </div>

                                                        </div>

                                                    </div>


                                                    {/* =====================
                                                        QUEUE INFORMATION
                                                    ====================== */}

                                                    <div className="grid grid-cols-2 gap-3 sm:flex">

                                                        {/* Queue Number */}
                                                        <div className="min-w-24 rounded-xl bg-blue-50 px-4 py-3 text-center">
                                                            <p className="text-xs font-medium text-blue-600">
                                                                Queue
                                                            </p>

                                                            <p className="mt-1 text-lg font-bold text-blue-700">
                                                                #{appointment.queueNumber ?? "—"}
                                                            </p>
                                                        </div>

                                                        {/* Slot ID */}
                                                        <div className="min-w-24 rounded-xl bg-slate-50 px-4 py-3 text-center">
                                                            <p className="text-xs font-medium text-slate-500">
                                                                Slot ID
                                                            </p>

                                                            <p className="mt-1 text-lg font-bold text-slate-900">
                                                                {appointment.slotId ?? "—"}
                                                            </p>
                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                            {/* APPOINTMENT STATUS ACTION */}

                                            {(() => {
                                                const actions: Partial<
                                                    Record<
                                                        AppointmentStatus,
                                                        {
                                                            label: string;
                                                            nextStatus: AppointmentStatus;
                                                        }
                                                    >
                                                > = {
                                                    BOOKED: {
                                                        label: "Check In",
                                                        nextStatus: "CHECKED_IN",
                                                    },
                                                    CONFIRMED: {
                                                        label: "Check In",
                                                        nextStatus: "CHECKED_IN",
                                                    },
                                                    CHECKED_IN: {
                                                        label: "Add to Queue",
                                                        nextStatus: "IN_QUEUE",
                                                    },
                                                    IN_QUEUE: {
                                                        label: "Start Consultation",
                                                        nextStatus: "IN_CONSULTATION",
                                                    },
                                                    IN_CONSULTATION: {
                                                        label: "Complete Consultation",
                                                        nextStatus: "COMPLETED",
                                                    },
                                                };

                                                const action = actions[appointment.status];

                                                if (!action) return null;

                                                return (
                                                    <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                updatingId !== null ||
                                                                (
                                                                    action.nextStatus === "IN_CONSULTATION" &&
                                                                    appointments.some(
                                                                        (item) =>
                                                                            item.status === "IN_CONSULTATION" &&
                                                                            item.id !== appointment.id
                                                                    )
                                                                )
                                                            }
                                                            onClick={() =>
                                                                handleStatusUpdate(
                                                                    appointment.id,
                                                                    action.nextStatus
                                                                )
                                                            }
                                                            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {updatingId === appointment.id
                                                                ? "Updating..."
                                                                : action.label}
                                                        </button>
                                                    </div>
                                                );
                                            })()}

                                        </motion.div>

                                    )
                                )}

                            </div>

                        )}

                </div>

            </main>

        </div>
    );
}


// =============================================================
// STAT CARD COMPONENT
// =============================================================

function StatCard({
                      title,
                      value,
                      icon,
                  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
}) {

    return (

        <motion.div
            initial={{
                opacity: 0,
                y: 10,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {value}
                    </p>

                </div>


                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                    {icon}

                </div>

            </div>

        </motion.div>

    );
}