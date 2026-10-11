
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
    ArrowRight,
    CalendarPlus2,
    Menu,
    Search,
    Stethoscope,
    UserRound,
    RefreshCw,
} from "lucide-react";

import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DoctorAvatar from "@/components/common/DoctorAvatar";
import {
    bookingService,
    type BookingDoctor,
} from "@/services/bookingService";

export default function FindDoctorsPage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const [search, setSearch] = useState("");
    const [doctors, setDoctors] = useState<BookingDoctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const timer = window.setTimeout(async () => {
            setLoading(true);

            try {
                const data = await bookingService.searchDoctors(search);

                if (active) {
                    setDoctors(data);
                    setError("");
                }
            } catch (err) {
                if (active) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load doctors."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        }, 300);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [search]);

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
                            Find Doctors
                        </h1>
                        <p className="text-xs font-medium text-slate-600">
                            Search doctors by name or specialization
                        </p>
                    </div>
                </header>

                <div className="space-y-6 p-4 sm:p-6 xl:p-8">
                    <section className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                                <Stethoscope className="h-6 w-6" />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-slate-950">
                                    Find Your Doctor
                                </h2>
                                <p className="mt-1 text-sm font-medium text-slate-700">
                                    Choose the right specialist for your consultation.
                                </p>
                            </div>
                        </div>

                        <div className="relative mt-6">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search doctor name or specialization..."
                                className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                            />
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

                    <section>
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-slate-950">
                                    Available Doctors
                                </h2>

                                <p className="mt-1 text-sm font-medium text-slate-700">
                                    {loading
                                        ? "Searching doctors..."
                                        : `${doctors.length} doctor(s) found`}
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                                <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                                <span className="ml-3 text-sm font-medium text-slate-700">
                  Loading doctors...
                </span>
                            </div>
                        ) : doctors.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                                <Stethoscope className="mx-auto h-10 w-10 text-blue-600" />

                                <h3 className="mt-4 text-lg font-bold text-slate-900">
                                    No Doctors Found
                                </h3>

                                <p className="mt-2 text-sm text-slate-700">
                                    Try searching by another name or specialization.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {doctors.map((doctor) => (
                                    <motion.article
                                        key={doctor.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                                    >
                                        <div className="flex items-start gap-3">
                                            <DoctorAvatar
                                                doctorId={doctor.id}
                                                name={doctor.name}
                                                className="h-14 w-14"
                                            />

                                            <div className="min-w-0">
                                                <h3 className="text-base font-bold text-slate-950">
                                                    {doctor.name}
                                                </h3>

                                                <p className="mt-1 text-sm font-semibold text-blue-700">
                                                    {doctor.specialization ?? "General Physician"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 border-t border-slate-200 pt-4">
                                            <p className="text-xs font-semibold text-slate-600">
                                                Email
                                            </p>

                                            <p className="mt-1 break-all text-sm text-slate-800">
                                                {doctor.email ?? "Not available"}
                                            </p>
                                        </div>

                                        <Link
                                            href={`/patient/book-appointment?doctorId=${doctor.id}`}
                                            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                                        >
                                            <CalendarPlus2 className="h-4 w-4" />
                                            Book Appointment
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </motion.article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </motion.div>
        </main>
    );
}
