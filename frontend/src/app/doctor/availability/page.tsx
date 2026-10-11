"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Menu,
    Plus,
    RefreshCw,
    Users,
} from "lucide-react";

import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { doctorService } from "@/services/doctorService";
import {
    AppointmentSlot,
    CreateDoctorAvailabilityRequest,
} from "@/types/doctor";

export default function DoctorAvailabilityPage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const [form, setForm] =
        useState<CreateDoctorAvailabilityRequest>({
            date: "",
            startTime: "",
            endTime: "",
            slotDurationMinutes: 30,
            maxPatientsPerSlot: 5,
        });

    const [slots, setSlots] = useState<AppointmentSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [slotsLoading, setSlotsLoading] = useState(false);

    // =========================================================
    // INPUT CHANGE
    // =========================================================

    const handleChange = (
        field: keyof CreateDoctorAvailabilityRequest,
        value: string | number
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const loadExistingSlots = async (date: string) => {
        if (!date) {
            setSlots([]);
            return;
        }

        try {
            setSlotsLoading(true);
            setError("");

            const existingSlots =
                await doctorService.getAvailability(date);

            setSlots(existingSlots);
        } catch (err) {
            console.error(
                "Load availability error:",
                err
            );

            setSlots([]);

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load availability."
            );
        } finally {
            setSlotsLoading(false);
        }
    };

    useEffect(() => {
        if (form.date) {
            loadExistingSlots(form.date);
        } else {
            setSlots([]);
        }
    }, [form.date]);

    // =========================================================
    // CREATE AVAILABILITY
    // =========================================================

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (
            !form.date ||
            !form.startTime ||
            !form.endTime
        ) {
            setError(
                "Please select date, start time and end time."
            );
            return;
        }

        if (form.startTime >= form.endTime) {
            setError(
                "End time must be later than start time."
            );
            return;
        }

        if (form.slotDurationMinutes <= 0) {
            setError(
                "Slot duration must be greater than 0."
            );
            return;
        }

        if (form.maxPatientsPerSlot <= 0) {
            setError(
                "Maximum patients must be greater than 0."
            );
            return;
        }

        try {
            setLoading(true);

            const createdSlots =
                await doctorService.createAvailability(form);

            setSlots(createdSlots);

            setSuccess(
                `${createdSlots.length} appointment ${
                    createdSlots.length === 1 ? "slot" : "slots"
                } created successfully.`
            );
        } catch (err) {
            console.error(
                "Create availability error:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to create availability."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FORMAT TIME
    // =========================================================

    const formatTime = (dateTime: string) => {
        return new Date(dateTime).toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }
        );
    };

    const formatDate = (dateTime: string) => {
        return new Date(dateTime).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    return (
        <main className="min-h-screen bg-[#f7f9fc]">

            {/* =====================================================
          SIDEBAR
      ===================================================== */}

            <DashboardSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

            <motion.div
                animate={{
                    marginLeft: collapsed ? 88 : 270,
                }}
                transition={{
                    duration: 0.25,
                }}
                className="min-h-screen max-lg:!ml-0"
            >

                {/* ===================================================
            HEADER
        =================================================== */}

                <header className="sticky top-0 z-30 flex h-20 items-center border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 xl:px-8">

                    <button
                        onClick={() => setMobileOpen(true)}
                        className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div>
                        <h1 className="font-bold text-slate-950 sm:text-lg">
                            Manage Availability
                        </h1>

                        <p className="hidden text-xs text-slate-400 sm:block">
                            Create your consultation schedule and
                            patient capacity
                        </p>
                    </div>
                </header>

                {/* ===================================================
            PAGE
        =================================================== */}

                <div className="p-4 sm:p-6 xl:p-8">

                    {/* Hero */}

                    <motion.section
                        initial={{
                            opacity: 0,
                            y: 15,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        className="rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-blue-600/15 sm:p-8"
                    >
                        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                            <div>
                                <p className="text-sm font-medium text-blue-100">
                                    Doctor Schedule
                                </p>

                                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                                    Set Your Availability
                                </h2>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-50">
                                    Define your consultation hours, slot
                                    duration and maximum patient capacity.
                                    MediCare will automatically generate the
                                    appointment slots.
                                </p>
                            </div>

                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                                <CalendarDays className="h-8 w-8" />
                            </div>
                        </div>
                    </motion.section>

                    {/* ===================================================
              FORM + INFO
          =================================================== */}

                    <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">

                        {/* FORM */}

                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 15,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.08,
                            }}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Plus className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-950">
                                        Create Availability
                                    </h2>

                                    <p className="text-xs text-slate-400">
                                        Add consultation slots for a selected day
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="mt-6"
                            >
                                <div className="grid gap-5 md:grid-cols-2">

                                    {/* DATE */}

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Date
                                        </label>

                                        <input
                                            type="date"
                                            required
                                            value={form.date}
                                            onChange={(event) =>
                                                handleChange(
                                                    "date",
                                                    event.target.value
                                                )
                                            }
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                        />
                                    </div>

                                    {/* START TIME */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Start Time
                                        </label>

                                        <input
                                            type="time"
                                            required
                                            value={form.startTime}
                                            onChange={(event) =>
                                                handleChange(
                                                    "startTime",
                                                    event.target.value
                                                )
                                            }
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                        />
                                    </div>

                                    {/* END TIME */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            End Time
                                        </label>

                                        <input
                                            type="time"
                                            required
                                            value={form.endTime}
                                            onChange={(event) =>
                                                handleChange(
                                                    "endTime",
                                                    event.target.value
                                                )
                                            }
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                        />
                                    </div>

                                    {/* SLOT DURATION */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Slot Duration
                                        </label>

                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="5"
                                                step="5"
                                                required
                                                value={
                                                    form.slotDurationMinutes
                                                }
                                                onChange={(event) =>
                                                    handleChange(
                                                        "slotDurationMinutes",
                                                        Number(
                                                            event.target.value
                                                        )
                                                    )
                                                }
                                                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-20 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                            />

                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                        minutes
                      </span>
                                        </div>
                                    </div>

                                    {/* CAPACITY */}

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Patients Per Slot
                                        </label>

                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={
                                                    form.maxPatientsPerSlot
                                                }
                                                onChange={(event) =>
                                                    handleChange(
                                                        "maxPatientsPerSlot",
                                                        Number(
                                                            event.target.value
                                                        )
                                                    )
                                                }
                                                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-20 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                            />

                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                        patients
                      </span>
                                        </div>
                                    </div>
                                </div>

                                {/* ERROR */}

                                {error && (
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: -5,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {/* SUCCESS */}

                                {success && (
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: -5,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                                    >
                                        <CheckCircle2 className="h-4 w-4 shrink-0" />

                                        {success}
                                    </motion.div>
                                )}

                                {/* SUBMIT */}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            Creating Slots...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" />
                                            Create Availability
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>

                        {/* INFORMATION */}

                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 15,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.15,
                            }}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                        >
                            <h2 className="font-bold text-slate-950">
                                How It Works
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Slots are generated automatically.
                            </p>

                            <div className="mt-6 space-y-5">

                                <div className="flex gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
                                        1
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Select schedule
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-400">
                                            Choose the consultation date and
                                            working hours.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
                                        2
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Set duration
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-400">
                                            Define how long each appointment
                                            window should be.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
                                        3
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Set capacity
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-400">
                                            Multiple patients can book the same
                                            slot up to this limit.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-7 rounded-xl bg-slate-50 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Users className="h-4 w-4 text-blue-600" />
                                    Capacity Example
                                </div>

                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                    A 10:00 AM slot with capacity 5 can accept
                                    five patient bookings. Each patient gets a
                                    separate queue number.
                                </p>
                            </div>
                        </motion.div>
                    </section>

                    {/* ===================================================
              CREATED SLOTS
          =================================================== */}

                    {slots.length > 0 && (
                        <motion.section
                            initial={{
                                opacity: 0,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                        >
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                                <div>
                                    <h2 className="text-lg font-bold text-slate-950">
                                        Created Slots
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-400">
                                        {slots.length} consultation slots were
                                        generated.
                                    </p>
                                </div>

                                <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Availability Created
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {slots.map((slot, index) => (
                                    <motion.div
                                        key={slot.id}
                                        initial={{
                                            opacity: 0,
                                            y: 10,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        transition={{
                                            delay: index * 0.04,
                                        }}
                                        whileHover={{
                                            y: -3,
                                        }}
                                        className="rounded-2xl border border-slate-200 p-4 transition-shadow hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between gap-3">

                                            <div>
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                                    <Clock3 className="h-4 w-4 text-blue-600" />

                                                    {formatTime(
                                                        slot.startTime
                                                    )}

                                                    <span className="text-slate-300">
                            —
                          </span>

                                                    {formatTime(
                                                        slot.endTime
                                                    )}
                                                </div>

                                                <p className="mt-2 text-xs text-slate-400">
                                                    {formatDate(
                                                        slot.startTime
                                                    )}
                                                </p>
                                            </div>

                                            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                        Slot #{slot.id}
                      </span>
                                        </div>

                                        <div className="mt-4 border-t border-slate-100 pt-4">
                                            <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Capacity
                        </span>

                                                <span className="text-sm font-bold text-slate-800">
                          {slot.bookedCount}/
                                                    {slot.maxCapacity}
                        </span>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Available Seats
                        </span>

                                                <span className="text-sm font-bold text-emerald-600">
                          {slot.availableSeats}
                        </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </div>
            </motion.div>
        </main>
    );
}