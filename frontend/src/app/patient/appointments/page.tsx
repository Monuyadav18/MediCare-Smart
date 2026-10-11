
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
    Activity,
    ArrowRight,
    CalendarDays,
    CalendarPlus2,
    CheckCircle2,
    Clock3,
    History,
    Menu,
    RefreshCw,
    Stethoscope,
    Users,
} from "lucide-react";

import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { patientService } from "@/services/patientService";
import type { Appointment } from "@/types/appointment";
import { cancellationService } from "@/services/profileService";
import RescheduleAppointmentModal from "@/components/appointments/RescheduleAppointmentModal";
import { appointmentService } from "@/services/appointmentService";

const STATUS_LABELS: Record<string, string> = {
    BOOKED: "Booked",
    CONFIRMED: "Confirmed",
    CHECKED_IN: "Checked In",
    IN_QUEUE: "Waiting in Queue",
    IN_CONSULTATION: "In Consultation",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    NO_SHOW: "No Show",
    RESCHEDULED: "Rescheduled",
};

const STATUS_STYLES: Record<string, string> = {
    BOOKED: "bg-blue-100 text-blue-800",
    CONFIRMED: "bg-indigo-100 text-indigo-800",
    CHECKED_IN: "bg-amber-100 text-amber-900",
    IN_QUEUE: "bg-violet-100 text-violet-800",
    IN_CONSULTATION: "bg-cyan-100 text-cyan-900",
    COMPLETED: "bg-emerald-100 text-emerald-800",
    CANCELLED: "bg-red-100 text-red-800",
    NO_SHOW: "bg-slate-200 text-slate-800",
    RESCHEDULED: "bg-orange-100 text-orange-800",
};

function formatDateTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function AppointmentCard({
                             appointment,
                             onCancel,
                             onReschedule,
                             onCheckIn,
                             cancelling = false,
                         }: {
    appointment: Appointment;
    onCancel?: (appointment: Appointment) => void;
    onReschedule?: (appointment: Appointment) => void;
    onCheckIn?: (appointment: Appointment) => void;
    cancelling?: boolean;
}) {
    const status = appointment.status;

    const [currentTime, setCurrentTime] = useState(() => Date.now());

    useEffect(() => {
        const interval = window.setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => window.clearInterval(interval);
    }, []);

    const canCancel =
        (status === "BOOKED" || status === "CONFIRMED") &&
        new Date(appointment.appointmentTime).getTime() > Date.now();

    const appointmentTimestamp = new Date(
        appointment.appointmentTime
    ).getTime();

    const checkInStart = appointmentTimestamp - 30 * 60 * 1000;
    const checkInEnd = appointmentTimestamp + 30 * 60 * 1000;

    const now = currentTime;

    const canCheckIn =
        (status === "BOOKED" || status === "CONFIRMED") &&
        Number.isFinite(appointmentTimestamp) &&
        now >= checkInStart;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                        <Stethoscope className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-600">
                            Appointment #{appointment.id}
                        </p>

                        <h3 className="mt-1 text-base font-bold text-slate-950">
                            {appointment.doctor?.name ?? "Doctor"}
                        </h3>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                            {appointment.doctor?.specialization ?? "General Consultation"}
                        </p>
                    </div>
                </div>

                <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-800"
                    }`}
                >
          {STATUS_LABELS[status] ?? status}
        </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <CalendarDays className="h-5 w-5 shrink-0 text-blue-700" />
                    <div>
                        <p className="text-xs font-semibold text-slate-600">
                            Appointment Date & Time
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-900">
                            {formatDateTime(appointment.appointmentTime)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3">
                    <Users className="h-5 w-5 shrink-0 text-blue-700" />
                    <div>
                        <p className="text-xs font-semibold text-slate-700">
                            Queue Number
                        </p>
                        <p className="mt-1 text-lg font-bold text-blue-800">
                            {appointment.queueNumber != null
                                ? `#${appointment.queueNumber}`
                                : "Not Assigned"}
                        </p>
                    </div>
                </div>
            </div>

            {appointment.reason && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                    <p className="text-xs font-semibold text-slate-600">
                        Reason for Visit
                    </p>
                    <p className="mt-1 text-sm text-slate-800">
                        {appointment.reason}
                    </p>
                </div>
            )}
            {((canCancel && (onCancel || onReschedule)) ||
                (canCheckIn && onCheckIn)) && (
                <div className="mt-4 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">

                    {canCancel && onReschedule && (
                        <button
                            type="button"
                            onClick={() => onReschedule(appointment)}
                            disabled={cancelling}
                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Reschedule
                        </button>
                    )}

                    {canCancel && onCancel && (
                        <button
                            type="button"
                            onClick={() => onCancel(appointment)}
                            disabled={cancelling}
                            className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-800 hover:bg-red-100 disabled:opacity-50"
                        >
                            Cancel Appointment
                        </button>
                    )}

                    {canCheckIn && onCheckIn && (
                        <button
                            type="button"
                            onClick={() => onCheckIn(appointment)}
                            disabled={cancelling}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Check In
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function MyAppointmentsPage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [selectedAppointment, setSelectedAppointment] =
        useState<Appointment | null>(null);
    const [rescheduleAppointment, setRescheduleAppointment] =
        useState<Appointment | null>(null);

    const [cancelling, setCancelling] = useState(false);
    const [cancelSuccess, setCancelSuccess] = useState("");
    const [checkingInId, setCheckingInId] = useState<number | null>(null);

    const loadAppointments = useCallback(async (silent = false) => {
        if (!silent) setRefreshing(true);

        try {
            const data = await patientService.getMyAppointments();
            setAppointments(data);
            setError("");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load appointments."
            );
        } finally {
            setLoading(false);
            if (!silent) setRefreshing(false);
        }
    }, []);

    const confirmCancellation = async () => {
        if (!selectedAppointment || cancelling) return;

        setCancelling(true);
        setError("");
        setCancelSuccess("");

        try {
            await cancellationService.cancelAppointment(selectedAppointment.id);

            setCancelSuccess(
                `Appointment #${selectedAppointment.id} cancelled successfully.`
            );

            setSelectedAppointment(null);

            // Refresh appointment list
            await loadAppointments(true);

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to cancel appointment."
            );
            setSelectedAppointment(null);
        } finally {
            setCancelling(false);
        }
    };

    const handleCheckIn = async (appointment: Appointment) => {
        if (checkingInId !== null) return;

        setCheckingInId(appointment.id);
        setError("");
        setCancelSuccess("");

        try {
            await appointmentService.checkInAppointment(appointment.id);

            setCancelSuccess(
                `Appointment #${appointment.id} checked in successfully.`
            );

            await loadAppointments(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to check in. Please try again."
            );
        } finally {
            setCheckingInId(null);
        }
    };

    useEffect(() => {
        if (!cancelSuccess) return;

        const timer = setTimeout(() => {
            setCancelSuccess("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [cancelSuccess]);

    useEffect(() => {
        let active = true;
        let inFlight = false;

        const fetchAppointments = async () => {
            if (!active || inFlight) return;

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
                if (active) setLoading(false);
            }
        };

        void fetchAppointments();

        const intervalId = window.setInterval(() => {
            void fetchAppointments();
        }, 10000);

        return () => {
            active = false;
            window.clearInterval(intervalId);
        };
    }, []);

    const { activeAppointments, completedAppointments, otherAppointments } =
        useMemo(() => {
            const active = appointments.filter(
                (appointment) =>
                    !["COMPLETED", "CANCELLED", "NO_SHOW"].includes(
                        appointment.status
                    )
            );

            const completed = appointments.filter(
                (appointment) => appointment.status === "COMPLETED"
            );

            const other = appointments.filter((appointment) =>
                ["CANCELLED", "NO_SHOW"].includes(appointment.status)
            );

            active.sort(
                (a, b) =>
                    new Date(a.appointmentTime).getTime() -
                    new Date(b.appointmentTime).getTime()
            );

            completed.sort(
                (a, b) =>
                    new Date(b.appointmentTime).getTime() -
                    new Date(a.appointmentTime).getTime()
            );

            return {
                activeAppointments: active,
                completedAppointments: completed,
                otherAppointments: other,
            };
        }, [appointments]);

    return (
        <main className="min-h-screen bg-[#f7f9fc] text-slate-900">
            <DashboardSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <motion.div
                animate={{ marginLeft: collapsed ? 88 : 270 }}
                transition={{ duration: 0.25 }}
                className="min-h-screen max-lg:!ml-0"
            >
                <header className="sticky top-0 z-30 flex h-20 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl sm:px-6 xl:px-8">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open sidebar"
                        className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 text-slate-700 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div>
                        <h1 className="text-lg font-bold text-slate-950">
                            My Appointments
                        </h1>
                        <p className="text-xs font-medium text-slate-600">
                            Manage bookings and track your consultation queue
                        </p>
                    </div>
                </header>

                <div className="space-y-6 p-4 sm:p-6 xl:p-8">
                    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                        <div>
                            <h2 className="text-xl font-bold text-slate-950">
                                Appointment Overview
                            </h2>
                            <p className="mt-1 text-sm text-slate-700">
                                View all your appointments and their latest status.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => void loadAppointments()}
                                disabled={refreshing}
                                className="inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-60"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${
                                        refreshing ? "animate-spin" : ""
                                    }`}
                                />
                                Refresh
                            </button>

                            <Link
                                href="/patient/book-appointment"
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                <CalendarPlus2 className="h-4 w-4" />
                                Book Appointment
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </section>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"
                        >
                            {error}
                        </div>
                    )}

                    {cancelSuccess && (
                        <div
                            role="status"
                            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
                        >
                            {cancelSuccess}
                        </div>
                    )}

                    <section className="grid gap-4 sm:grid-cols-3">
                        {[
                            {
                                label: "Total Appointments",
                                value: appointments.length,
                                icon: CalendarDays,
                            },
                            {
                                label: "Active Appointments",
                                value: activeAppointments.length,
                                icon: Activity,
                            },
                            {
                                label: "Completed Visits",
                                value: completedAppointments.length,
                                icon: CheckCircle2,
                            },
                        ].map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <div
                                    key={stat.label}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-slate-700">
                                            {stat.label}
                                        </p>
                                        <Icon className="h-5 w-5 text-blue-700" />
                                    </div>
                                    <p className="mt-3 text-3xl font-bold text-slate-950">
                                        {loading ? "—" : stat.value}
                                    </p>
                                </div>
                            );
                        })}
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Clock3 className="h-5 w-5 text-blue-700" />
                            <h2 className="text-lg font-bold text-slate-950">
                                Active Appointments
                            </h2>
                        </div>

                        {loading ? (
                            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-700">
                                Loading appointments...
                            </div>
                        ) : activeAppointments.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                                <CalendarPlus2 className="mx-auto h-9 w-9 text-blue-600" />
                                <p className="mt-3 font-semibold text-slate-900">
                                    No active appointments
                                </p>
                                <Link
                                    href="/patient/book-appointment"
                                    className="mt-3 inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-900"
                                >
                                    Book your first appointment
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-4 xl:grid-cols-2">
                                {activeAppointments.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.id}
                                        appointment={appointment}
                                        onCancel={setSelectedAppointment}
                                        onReschedule={setRescheduleAppointment}
                                        onCheckIn={handleCheckIn}
                                        cancelling={cancelling || checkingInId !== null}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <History className="h-5 w-5 text-blue-700" />
                            <h2 className="text-lg font-bold text-slate-950">
                                Appointment History
                            </h2>
                        </div>

                        {completedAppointments.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-700">
                                No completed consultations yet.
                            </div>
                        ) : (
                            <div className="grid gap-4 xl:grid-cols-2">
                                {completedAppointments.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.id}
                                        appointment={appointment}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {otherAppointments.length > 0 && (
                        <section className="space-y-4">
                            <h2 className="text-lg font-bold text-slate-950">
                                Cancelled / Missed Appointments
                            </h2>

                            <div className="grid gap-4 xl:grid-cols-2">
                                {otherAppointments.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.id}
                                        appointment={appointment}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    <p className="text-xs font-medium text-slate-600">
                        Appointment information refreshes automatically every 10 seconds.
                    </p>
                </div>
            </motion.div>
            {selectedAppointment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cancel-dialog-title"
                        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
                    >
                        <h2
                            id="cancel-dialog-title"
                            className="text-xl font-bold text-slate-950"
                        >
                            Cancel Appointment?
                        </h2>

                        <p className="mt-3 text-lg leading-6 text-slate-700">
                            Are you sure you want to cancel appointment{" "}
                            {/*<strong>#{selectedAppointment.id}</strong>*/}
                            with{" "}
                            <strong>{selectedAppointment.doctor?.name}</strong>?
                        </p>

                        {/*<p className="mt-2 text-sm font-medium text-red-700">*/}
                        {/*    This action cannot be undone.*/}
                        {/*</p>*/}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                disabled={cancelling}
                                onClick={() => setSelectedAppointment(null)}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50"
                            >
                                Keep Appointment
                            </button>

                            <button
                                type="button"
                                disabled={cancelling}
                                onClick={() => void confirmCancellation()}
                                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {cancelling ? "Cancelling..." : "Yes, Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {rescheduleAppointment && (
                <RescheduleAppointmentModal
                    appointment={rescheduleAppointment}
                    onClose={() => setRescheduleAppointment(null)}
                    onSuccess={() => {
                        setRescheduleAppointment(null);
                        setCancelSuccess("Appointment rescheduled successfully.");
                        void loadAppointments(true);
                    }}
                />
            )}
        </main>
    );
}
