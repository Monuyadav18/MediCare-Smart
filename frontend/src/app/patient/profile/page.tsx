"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
    CalendarDays,
    CheckCircle2,
    Droplets,
    Edit3,
    Loader2,
    Mail,
    Menu,
    Save,
    ShieldCheck,
    UserRound,
    X,
} from "lucide-react";

import DashboardSidebar from "@/components/layout/DashboardSidebar";
import {
    profileService,
    type PatientProfile,
    type UpdatePatientProfile,
} from "@/services/profileService";

const genders = ["MALE", "FEMALE", "OTHER"];
const bloodGroups = [
    { value: "A_POSITIVE", label: "A+" },
    { value: "A_NEGATIVE", label: "A-" },
    { value: "B_POSITIVE", label: "B+" },
    { value: "B_NEGATIVE", label: "B-" },
    { value: "AB_POSITIVE", label: "AB+" },
    { value: "AB_NEGATIVE", label: "AB-" },
    { value: "O_POSITIVE", label: "O+" },
    { value: "O_NEGATIVE", label: "O-" },
];

function toForm(profile: PatientProfile): UpdatePatientProfile {
    return {
        name: profile.name ?? "",
        gender: profile.gender,
        birthDate: profile.birthDate,
        bloodGroup: profile.bloodGroup,
    };
}

export default function PatientProfilePage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const [profile, setProfile] = useState<PatientProfile | null>(null);
    const [form, setForm] = useState<UpdatePatientProfile>({
        name: "",
        gender: null,
        birthDate: null,
        bloodGroup: null,
    });

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!success) return;

        const timer = setTimeout(() => {
            setSuccess("");
        }, 2000);

        return () => clearTimeout(timer);
    }, [success]);

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await profileService.getProfile();
            setProfile(data);
            setForm(toForm(data));
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to load profile."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadProfile();
    }, [loadProfile]);

    function cancelEdit() {
        if (profile) setForm(toForm(profile));
        setEditing(false);
        setError("");
    }

    async function saveProfile() {
        if (!form.name.trim()) {
            setError("Patient name is required.");
            return;
        }

        if (form.name.trim().length > 40) {
            setError("Name cannot exceed 40 characters.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const updated = await profileService.updateProfile({
                ...form,
                name: form.name.trim(),
            });

            setProfile(updated);
            setForm(toForm(updated));
            setEditing(false);
            setSuccess("Profile updated successfully!");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to update profile."
            );
        } finally {
            setSaving(false);
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
                <header className="sticky top-0 z-30 flex h-20 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl sm:px-6 xl:px-8">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open sidebar"
                        className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 text-slate-900 lg:hidden"
                    >
                        <Menu size={20} />
                    </button>

                    <div>
                        <h1 className="text-lg font-bold text-slate-950">
                            My Profile
                        </h1>
                        <p className="text-xs text-slate-600">
                            Manage your personal and medical information
                        </p>
                    </div>
                </header>

                <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 xl:p-8">
                    <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white sm:p-8">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                                <UserRound size={32} />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold">Patient Profile</h2>
                                <p className="mt-1 text-sm text-blue-100">
                                    Your personal healthcare information
                                </p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"
                        >
                            {error}
                        </div>
                    )}

                    {success && (
                        <div
                            role="status"
                            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900"
                        >
                            <CheckCircle2 size={18} />
                            {success}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center rounded-3xl bg-white p-20">
                            <Loader2 className="animate-spin text-blue-600" size={30} />
                        </div>
                    ) : !profile ? (
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
                            <p className="font-medium text-slate-800">
                                Patient profile could not be loaded.
                            </p>
                            <button
                                onClick={() => void loadProfile()}
                                className="mt-4 rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-950">
                                        Personal Information
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Patient ID: #{profile.id}
                                    </p>
                                </div>

                                {!editing ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditing(true);
                                            setSuccess("");
                                        }}
                                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                                    >
                                        <Edit3 size={16} />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>
                                )}
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                                        <UserRound size={16} className="text-blue-600" />
                                        Full Name
                                    </label>
                                    <input
                                        value={form.name}
                                        disabled={!editing}
                                        maxLength={40}
                                        onChange={(e) =>
                                            setForm({ ...form, name: e.target.value })
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-500 focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                                        <Mail size={16} className="text-blue-600" />
                                        Account Email / Username
                                    </label>
                                    <input
                                        value={profile.email ?? ""}
                                        disabled
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                                        <UserRound size={16} className="text-blue-600" />
                                        Gender
                                    </label>
                                    <select
                                        value={form.gender ?? ""}
                                        disabled={!editing}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                gender: e.target.value || null,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-800"
                                    >
                                        <option value="">Not specified</option>
                                        {genders.map((gender) => (
                                            <option key={gender} value={gender}>
                                                {gender}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                                        <CalendarDays size={16} className="text-blue-600" />
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={form.birthDate ?? ""}
                                        max={new Date().toISOString().slice(0, 10)}
                                        disabled={!editing}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                birthDate: e.target.value || null,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                                        <Droplets size={16} className="text-red-600" />
                                        Blood Group
                                    </label>
                                    <select
                                        value={form.bloodGroup ?? ""}
                                        disabled={!editing}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                bloodGroup: e.target.value || null,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-800"
                                    >
                                        <option value="">Not specified</option>

                                        {bloodGroups.map((group) => (
                                            <option key={group.value} value={group.value}>
                                                {group.label}
                                            </option>
                                        ))}
                                    </select>
                                    {/*<p className="mt-2 text-xs text-slate-600">*/}
                                    {/*    Blood group editing will be enabled after verifying*/}
                                    {/*    the backend enum values.*/}
                                    {/*</p>*/}
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                                        <ShieldCheck size={16} className="text-blue-600" />
                                        Account Status
                                    </label>
                                    <input
                                        value="Patient"
                                        disabled
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-800"
                                    />
                                </div>
                            </div>

                            {editing && (
                                <div className="mt-8 flex justify-end border-t border-slate-200 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => void saveProfile()}
                                        disabled={saving || !form.name.trim()}
                                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <Loader2 size={17} className="animate-spin" />
                                        ) : (
                                            <Save size={17} />
                                        )}
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </motion.div>
        </main>
    );
}