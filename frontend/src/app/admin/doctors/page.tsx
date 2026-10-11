"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
    Menu,
    Plus,
    RefreshCw,
    Search,
    Stethoscope,
    UserPlus,
    X,
} from "lucide-react";

import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { adminService } from "@/services/adminService";
import DoctorAvatar from "@/components/common/DoctorAvatar";
import {
    CreateDoctorRequest,
    Doctor,
} from "@/types/doctor";

export default function AdminDoctorsPage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [specialization, setSpecialization] =
        useState("ALL");

    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] =
        useState<CreateDoctorRequest>({
            name: "",
            email: "",
            password: "",
            specialization: "",
        });

    const loadDoctors = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await adminService.getDoctors();

            setDoctors(data);
        } catch (err) {
            console.error("Doctors API Error:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load doctors."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDoctors();
    }, []);

    const specializations = useMemo(() => {
        return [
            "ALL",
            ...Array.from(
                new Set(
                    doctors
                        .map((doctor) => doctor.specialization)
                        .filter(Boolean)
                )
            ),
        ];
    }, [doctors]);

    const filteredDoctors = useMemo(() => {
        const query = search.trim().toLowerCase();

        return doctors.filter((doctor) => {
            const matchesSearch =
                !query ||
                doctor.name.toLowerCase().includes(query) ||
                doctor.specialization
                    .toLowerCase()
                    .includes(query) ||
                (doctor.email ?? "")
                    .toLowerCase()
                    .includes(query);

            const matchesSpecialization =
                specialization === "ALL" ||
                doctor.specialization === specialization;

            return matchesSearch && matchesSpecialization;
        });
    }, [doctors, search, specialization]);

    const openModal = () => {
        setForm({
            name: "",
            email: "",
            password: "",
            specialization: "",
        });

        setFormError("");
        setSuccess("");
        setShowModal(true);
    };


const handleOnboard = async (
    event: FormEvent<HTMLFormElement>
) => {
    event.preventDefault();

    setFormError("");
    setSuccess("");

    if (!form.name.trim()) {
        setFormError("Doctor name is required.");
        return;
    }

    if (!form.email.trim()) {
        setFormError("Email address is required.");
        return;
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email.trim())) {
        setFormError(
            "Please enter a valid email address."
        );
        return;
    }

    if (!form.password) {
        setFormError(
            "Temporary password is required."
        );
        return;
    }

    if (form.password.length < 8) {
        setFormError(
            "Password must contain at least 8 characters."
        );
        return;
    }

    if (!form.specialization.trim()) {
        setFormError(
            "Specialization is required."
        );
        return;
    }

    try {
        setSubmitting(true);

        await adminService.createDoctor({
            name: form.name.trim(),
            email: form.email
                .trim()
                .toLowerCase(),
            password: form.password,
            specialization:
                form.specialization.trim(),
        });

        setSuccess(
            "Doctor account created successfully."
        );

        await loadDoctors();

        setTimeout(() => {
            setShowModal(false);
            setSuccess("");
        }, 900);
    } catch (err) {
        console.error(
            "Create Doctor Error:",
            err
        );

        setFormError(
            err instanceof Error
                ? err.message
                : "Unable to create doctor."
        );
    } finally {
        setSubmitting(false);
    }
};

    return (
        <main className="min-h-screen bg-[#f7f9fc]">
            <DashboardSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <motion.div
                animate={{
                    marginLeft: collapsed ? 88 : 270,
                }}
                transition={{ duration: 0.25 }}
                className="min-h-screen max-lg:!ml-0"
            >
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 xl:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div>
                            <h1 className="font-bold text-slate-950 sm:text-lg">
                                Doctor Management
                            </h1>

                            <p className="hidden text-xs text-slate-400 sm:block">
                                Manage registered MediCare doctors
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={openModal}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                    >
                        <UserPlus className="h-4 w-4" />

                        <span className="hidden sm:inline">
              Create Doctor
            </span>

                        <span className="sm:hidden">
              Add
            </span>
                    </button>
                </header>

                <section className="p-4 sm:p-6 xl:p-8">
                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                            Healthcare Team
                        </p>

                        <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
                            Doctors
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            View, search and manage doctors registered
                            on the platform.
                        </p>
                    </motion.div>

                    {/* Search/filter */}
                    <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search doctor or specialization..."
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                            />
                        </div>

                        <select
                            value={specialization}
                            onChange={(event) =>
                                setSpecialization(event.target.value)
                            }
                            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-600 outline-none focus:border-blue-500 md:min-w-52"
                        >
                            {specializations.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item === "ALL"
                                        ? "All Specializations"
                                        : item}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={loadDoctors}
                            title="Refresh doctors"
                            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex min-h-80 items-center justify-center">
                            <div className="text-center">
                                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                                <p className="mt-4 text-sm text-slate-500">
                                    Loading doctors...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                            <p className="font-semibold text-red-600">
                                Unable to load doctors
                            </p>

                            <p className="mt-2 text-sm text-red-500">
                                {error}
                            </p>

                            <button
                                onClick={loadDoctors}
                                className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Doctor cards */}
                    {!loading && !error && (
                        <>
                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-sm text-slate-500">
                                    Showing{" "}
                                    <span className="font-bold text-slate-900">
                    {filteredDoctors.length}
                  </span>{" "}
                                    doctor(s)
                                </p>
                            </div>

                            {filteredDoctors.length === 0 ? (
                                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                                    <Stethoscope className="mx-auto h-10 w-10 text-slate-300" />

                                    <p className="mt-4 font-semibold text-slate-700">
                                        No doctors found
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Try changing your search or
                                        specialization filter.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {filteredDoctors.map(
                                        (doctor, index) => (
                                            <motion.article
                                                key={doctor.id}
                                                initial={{
                                                    opacity: 0,
                                                    y: 15,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                transition={{
                                                    delay: index * 0.06,
                                                }}
                                                whileHover={{
                                                    y: -4,
                                                }}
                                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <DoctorAvatar
                                                        doctorId={doctor.id}
                                                        name={doctor.name}
                                                        className="h-14 w-14 min-w-14"
                                                    />

                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="truncate font-bold text-slate-900">
                                                            {doctor.name}
                                                        </h3>

                                                        <p className="mt-1 text-sm font-medium text-blue-600">
                                                            {doctor.specialization}
                                                        </p>

                                                        <p className="mt-2 truncate text-xs text-slate-400">
                                                            {doctor.email ??
                                                                "Email not available"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                            Active
                          </span>

                                                    <span className="text-xs font-medium text-slate-400">
                            Doctor ID #{doctor.id}
                          </span>
                                                </div>
                                            </motion.article>
                                        )
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </section>
            </motion.div>

            {/* Onboard Doctor Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.96,
                            y: 15,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-950">
                                    Onboard Doctor
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    Create a new doctor account and profile.
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowModal(false)
                                }
                                disabled={submitting}
                                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleOnboard}
                            className="space-y-5 p-5 sm:p-6"
                        >

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Doctor Name
                                </label>

                                <input
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            name: event.target.value,
                                        })
                                    }
                                    placeholder="Dr. Amit Sharma"
                                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            email: event.target.value,
                                        })
                                    }
                                    placeholder="doctor@medicare.com"
                                    autoComplete="email"
                                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Temporary Password
                                </label>

                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            password: event.target.value,
                                        })
                                    }
                                    placeholder="Minimum 8 characters"
                                    autoComplete="new-password"
                                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                />

                                <p className="mt-2 text-xs text-slate-400">
                                    Doctor will use this password for the initial login.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Specialization
                                </label>

                                <input
                                    value={form.specialization}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            specialization:
                                            event.target.value,
                                        })
                                    }
                                    placeholder="e.g. Orthopedics"
                                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                />
                            </div>

                            {formError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {formError}
                                </div>
                            )}

                            {success && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
                                    {success}
                                </div>
                            )}

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowModal(false)
                                    }
                                    disabled={submitting}
                                    className="h-12 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" />
                                            Add New Doctor
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </main>
    );
}