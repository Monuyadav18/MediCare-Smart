"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    Clock3,
    Loader2,
    Menu,
    Search,
    Stethoscope,
    Users,
} from "lucide-react";
import { motion } from "motion/react";

import DashboardSidebar from "@/components/layout/DashboardSidebar";
import {
    bookingService,
    type BookingDoctor,
    type BookingSlot,
} from "@/services/bookingService";
import type { Appointment } from "@/types/appointment";

function localDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatTime(value: string): string {
    return new Date(value).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function BookAppointmentPage() {

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const [search, setSearch] = useState("");
    const [doctors, setDoctors] = useState<BookingDoctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] =
        useState<BookingDoctor | null>(null);

    const [date, setDate] = useState(() => localDateString(new Date()));
    const [slots, setSlots] = useState<BookingSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);

    const [reason, setReason] = useState("");
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState<Appointment | null>(null);

    const [doctorId, setDoctorId] = useState<number | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const value = params.get("doctorId");
        const parsedId = value ? Number(value) : null;

        if (parsedId !== null && Number.isInteger(parsedId) && parsedId > 0) {
            setDoctorId(parsedId);
        }
    }, []);

    useEffect(() => {
        let active = true;

        const timer = setTimeout(async () => {
            setLoadingDoctors(true);

            try {
                const data = await bookingService.searchDoctors(search);
                if (active) setDoctors(data);
            } catch (err) {
                if (active) {
                    setError(err instanceof Error ? err.message : "Unable to load doctors.");
                }
            } finally {
                if (active) setLoadingDoctors(false);
            }
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [search]);

    useEffect(() => {
        if (doctorId === null) return;

        const doctor = doctors.find((item) => item.id === doctorId);

        if (doctor) {
            setSelectedDoctor((current) =>
                current?.id === doctor.id ? current : doctor
            );
        }
    }, [doctorId, doctors]);

    useEffect(() => {
        if (!selectedDoctor) {
            setSlots([]);
            setSelectedSlot(null);
            return;
        }

        let active = true;

        async function loadSlots() {
            setLoadingSlots(true);
            setSelectedSlot(null);
            setError("");

            try {
                const data = await bookingService.getDoctorSlots(
                    selectedDoctor!.id,
                    date
                );

                if (active) setSlots(data);
            } catch (err) {
                if (active) {
                    setError(err instanceof Error ? err.message : "Unable to load slots.");
                }
            } finally {
                if (active) setLoadingSlots(false);
            }
        }

        void loadSlots();

        return () => {
            active = false;
        };
    }, [selectedDoctor, date]);

    async function handleBooking() {
        if (!selectedSlot || !reason.trim()) {
            setError("Please select a slot and enter your reason for visit.");
            return;
        }

        setBooking(true);
        setError("");

        try {
            const appointment = await bookingService.createAppointment(
                selectedSlot.id,
                reason.trim()
            );

            setSuccess(appointment);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Booking failed.");
        } finally {
            setBooking(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#f7f9fc]">
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
                <header className="sticky top-0 z-30 flex h-20 items-center border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 xl:px-8">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open sidebar"
                        className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-800 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div>
                        <h1 className="font-bold text-slate-950 sm:text-lg">
                            Book Appointment
                        </h1>
                        <p className="hidden text-xs text-slate-600 sm:block">
                            Find your doctor and reserve an available slot
                        </p>
                    </div>
                </header>

                <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 xl:p-8">
                    <Link
                        href="/patient/dashboard"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-600"
                    >
                        <ChevronLeft size={17} />
                        Back to Dashboard
                    </Link>

                    {success ? (
                        <div className="mx-auto max-w-xl rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
                            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" />

                            <h2 className="text-2xl font-bold text-slate-900">
                                Appointment Booked!
                            </h2>

                            <p className="mt-2 text-sm text-slate-700">
                                Your appointment has been successfully reserved.
                            </p>

                            <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-semibold text-slate-700">
                                          Doctor Name
                                    </span>
                                    <span className="text-sm font-bold text-slate-950">
                                          {success.doctor.name}
                                    </span>
                                    </div>

                                    <div className="border-t border-slate-200" />

                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-semibold text-slate-700">
                                             Appointment ID
                                        </span>
                                         <span className="text-sm font-bold text-slate-950">
                                            #{success.id}
                                         </span>
                                    </div>

                                    <div className="border-t border-slate-200" />

                                         <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-semibold text-slate-700">
                                              Queue Number
                                        </span>
                                             <span className="text-lg font-extrabold text-blue-800">
                                                {success.queueNumber != null
                                                    ? `#${success.queueNumber}`
                                                    : "Pending"}
                                             </span>
                                    </div>

                                    <div className="border-t border-slate-200" />

                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-sm font-semibold text-slate-700">
                                              Booking Status
                                            </span>
                                                <span className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
                                                    {success.status}
                                                </span>
                                        </div>
                            </div>

                            <Link
                                href="/patient/appointments"
                                className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                            >
                                View My Appointments
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white sm:p-8">
                                <h2 className="text-2xl font-bold">
                                    Find the right doctor for you
                                </h2>
                                <p className="mt-2 text-sm text-blue-100">
                                    Search specialists, choose a convenient time and book your visit.
                                </p>
                            </div>

                            {error && (
                                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
                                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                    <div className="mb-5 flex items-center gap-3">
                                        <Stethoscope className="text-blue-600" />
                                        <h3 className="text-lg font-bold text-slate-900">
                                            1. Select Doctor
                                        </h3>
                                    </div>

                                    <div className="relative">
                                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-600" />
                                        <input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search name or specialization..."
                                            className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto">
                                        {loadingDoctors ? (
                                            <div className="flex justify-center py-10">
                                                <Loader2 className="animate-spin text-blue-600" />
                                            </div>
                                        ) : doctors.length === 0 ? (
                                            <p className="py-8 text-center text-sm text-slate-700">
                                                No doctors found.
                                            </p>
                                        ) : (
                                            doctors.map((doctor) => (
                                                <button
                                                    key={doctor.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedDoctor(doctor);
                                                        setSelectedSlot(null);
                                                        setError("");
                                                    }}
                                                    className={`w-full rounded-2xl border p-4 text-left transition ${
                                                        selectedDoctor?.id === doctor.id
                                                            ? "border-blue-500 bg-blue-50"
                                                            : "border-slate-200 hover:border-blue-200"
                                                    }`}
                                                >
                                                    <p className="font-bold text-slate-900">{doctor.name}</p>
                                                    <p className="mt-1 text-sm text-blue-600">
                                                        {doctor.specialization || "General Physician"}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-600">
                                                        {doctor.email}
                                                    </p>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </section>

                                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                    <div className="mb-5 flex items-center gap-3">
                                        <CalendarDays className="text-blue-600" />
                                        <h3 className="text-lg font-bold text-slate-900">
                                            2. Choose Date & Time
                                        </h3>
                                    </div>

                                    <label className="mb-2 block text-sm font-medium text-slate-800">
                                        Appointment Date
                                    </label>

                                    <input
                                        type="date"
                                        value={date}
                                        min={localDateString(new Date())}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                                    />

                                    {!selectedDoctor ? (
                                        <p className="py-12 text-center text-sm text-slate-600">
                                            Select a doctor to view available slots.
                                        </p>
                                    ) : loadingSlots ? (
                                        <div className="flex justify-center py-12">
                                            <Loader2 className="animate-spin text-blue-600" />
                                        </div>
                                    ) : slots.length === 0 ? (
                                        <p className="py-12 text-center text-sm text-slate-600">
                                            No available slots for this date.
                                        </p>
                                    ) : (
                                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            {slots.map((slot) => (
                                                <button
                                                    key={slot.id}
                                                    type="button"
                                                    disabled={slot.availableSeats <= 0}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`rounded-xl border p-3 text-center transition ${
                                                        selectedSlot?.id === slot.id
                                                            ? "border-blue-600 bg-blue-50"
                                                            : "border-slate-200 hover:border-blue-300"
                                                    } disabled:cursor-not-allowed disabled:opacity-40`}
                                                >
                                                    <Clock3 className="mx-auto mb-2 h-4 w-4 text-blue-600" />
                                                    <p className="text-xs font-bold text-slate-900">
                                                        {formatTime(slot.startTime)}
                                                    </p>
                                                    <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-slate-700">
                                                        <Users size={12} />
                                                        {slot.availableSeats} seats
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>

                            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <h3 className="text-lg font-bold text-slate-900">
                                    3. Confirm Appointment
                                </h3>

                                <p className="mt-2 text-sm text-slate-700">
                                    {selectedDoctor
                                        ? `Doctor: ${selectedDoctor.name}`
                                        : "Please select a doctor first."}
                                </p>

                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                    placeholder="Reason for visit (e.g. fever, headache, consultation)"
                                    className="mt-5 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-blue-500"
                                />

                                <button
                                    type="button"
                                    onClick={handleBooking}
                                    disabled={booking || !selectedSlot || !reason.trim()}
                                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {booking && <Loader2 size={17} className="animate-spin" />}
                                    {booking ? "Booking..." : "Confirm Appointment"}
                                </button>
                            </section>
                        </>
                    )}
                </div>
            </motion.div>
        </main>
    );
}