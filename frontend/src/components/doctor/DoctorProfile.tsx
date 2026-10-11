
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    BadgeCheck,
    BriefcaseMedical,
    Building2,
    Camera,
    CheckCircle2,
    CircleAlert,
    GraduationCap,
    Loader2,
    Mail,
    MapPin,
    Pencil,
    Save,
    ShieldCheck,
    Stethoscope,
    UserRound,
    X,
} from "lucide-react";

import { doctorProfileService } from "@/services/doctorProfileService";
import type {
    DoctorProfile as DoctorProfileType,
    UpdateDoctorProfile,
} from "@/types/doctorProfile";


type EditableField = keyof UpdateDoctorProfile;

const editableFields: EditableField[] = [
    "name",
    "specialization",
    "phone",
    "gender",
    "qualification",
    "experienceYears",
    "consultationFee",
    "hospitalName",
    "address",
    "city",
    "state",
];

function createForm(profile: DoctorProfileType): UpdateDoctorProfile {
    return {
        name: profile.name,
        specialization: profile.specialization,
        phone: profile.phone,
        gender: profile.gender,
        qualification: profile.qualification,
        experienceYears: profile.experienceYears,
        consultationFee: profile.consultationFee,
        hospitalName: profile.hospitalName,
        address: profile.address,
        city: profile.city,
        state: profile.state,
    };
}

function display(value: string | number | null | undefined) {
    return value === null || value === undefined || value === ""
        ? "Not provided"
        : String(value);
}

const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500 transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";

function Info({
                  label,
                  value,
              }: {
    label: string;
    value: string | number | null | undefined;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {label}
            </p>
            <p className="break-words text-sm font-semibold text-slate-900">
                {display(value)}
            </p>
        </div>
    );
}

function Section({
                     title,
                     description,
                     icon: Icon,
                     children,
                 }: {
    title: string;
    description: string;
    icon: typeof UserRound;
    children: React.ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 border-b border-slate-100 p-5 sm:p-6">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{description}</p>
                </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                {children}
            </div>
        </section>
    );
}

export default function DoctorProfile() {
    const [profile, setProfile] = useState<DoctorProfileType | null>(null);
    const [form, setForm] = useState<UpdateDoctorProfile | null>(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Doctor profile photo
    const [photoSrc, setPhotoSrc] = useState<string | null>(null);
    const [photoLoading, setPhotoLoading] = useState(false);
    const [photoSaving, setPhotoSaving] = useState(false);

// Hidden file input reference
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!success) return;

        const timer = setTimeout(() => {
            setSuccess("");
        }, 2000);

        return () => clearTimeout(timer);
    }, [success]);

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await doctorProfileService.getProfile();
            setProfile(data);
            setForm(createForm(data));
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

    useEffect(() => {
        const photoUrl = profile?.profileImageUrl;

        if (!photoUrl) {
            setPhotoSrc(null);
            setPhotoLoading(false);
            return;
        }

        let active = true;
        let objectUrl: string | null = null;

        async function loadPhoto() {
            try {
                setPhotoLoading(true);

                const blob = await doctorProfileService.getPhotoBlob(photoUrl!);

                if (!active) return;

                objectUrl = URL.createObjectURL(blob);
                setPhotoSrc(objectUrl);
            } catch (err) {
                if (active) {
                    setPhotoSrc(null);
                    console.error("Photo loading failed:", err);
                }
            } finally {
                if (active) {
                    setPhotoLoading(false);
                }
            }
        }

        void loadPhoto();

        return () => {
            active = false;

            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [profile?.profileImageUrl]);

    function changeField(field: EditableField, value: string) {
        setForm((previous) => {
            if (!previous) return previous;

            if (field === "experienceYears" || field === "consultationFee") {
                return {
                    ...previous,
                    [field]: value === "" ? null : Number(value),
                };
            }

            return { ...previous, [field]: value || null };
        });
    }

    function startEditing() {
        if (!profile) return;
        setForm(createForm(profile));
        setEditing(true);
        setSuccess("");
        setError("");
    }

    function cancelEditing() {
        if (profile) setForm(createForm(profile));
        setEditing(false);
        setError("");
    }

    async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!form || saving) return;

        if (!form.name?.trim()) {
            setError("Doctor name is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const updated = await doctorProfileService.updateProfile({
                ...form,
                name: form.name.trim(),
            });

            setProfile(updated);
            setForm(createForm(updated));
            setEditing(false);
            setSuccess("Your profile has been updated successfully.");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to update profile."
            );
        } finally {
            setSaving(false);
        }
    }

    async function handlePhotoUpload(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];

        if (!file || photoSaving) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Only JPG, PNG and WebP images are allowed.");
            event.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError("Image size must not exceed 2 MB.");
            event.target.value = "";
            return;
        }

        try {
            setPhotoSaving(true);
            setError("");
            setSuccess("");

            const result = await doctorProfileService.uploadPhoto(file);

            setProfile((previous) =>
                previous
                    ? {
                        ...previous,
                        profileImageUrl: result.profileImageUrl,
                    }
                    : previous
            );

            setSuccess("Profile photo uploaded successfully.");

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to upload profile photo."
            );
        } finally {
            setPhotoSaving(false);
            event.target.value = "";
        }
    }

    async function handlePhotoRemove() {
        if (photoSaving) return;

        try {
            setPhotoSaving(true);
            setError("");
            setSuccess("");

            await doctorProfileService.deletePhoto();

            setProfile((previous) =>
                previous
                    ? {
                        ...previous,
                        profileImageUrl: null,
                    }
                    : previous
            );

            setPhotoSrc(null);
            setSuccess("Profile photo removed successfully.");

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to remove profile photo."
            );
        } finally {
            setPhotoSaving(false);
        }
    }

    function Field({
                       label,
                       field,
                       type = "text",
                       placeholder,
                   }: {
        label: string;
        field: EditableField;
        type?: string;
        placeholder?: string;
    }) {
        if (!form) return null;

        return (
            <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-800">
          {label}
        </span>
                <input
                    type={type}
                    min={type === "number" ? 0 : undefined}
                    max={field === "experienceYears" ? 70 : undefined}
                    step={field === "consultationFee" ? "0.01" : undefined}
                    value={form[field] ?? ""}
                    onChange={(event) => changeField(field, event.target.value)}
                    placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
                    className={inputClass}
                />
            </label>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center gap-3 text-blue-700">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="font-semibold">Loading doctor profile...</span>
            </div>
        );
    }

    if (!profile || !form) {
        return (
            <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
                <CircleAlert className="mx-auto mb-3 h-8 w-8 text-red-600" />
                <p className="font-semibold text-slate-900">
                    {error || "Doctor profile unavailable."}
                </p>
                <button
                    onClick={() => void loadProfile()}
                    className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const initials = profile.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");

    return (
        <div className="mx-auto max-w-6xl space-y-6 pb-12">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-blue-700">
                        Doctor Workspace / Profile
                    </p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                        My Profile
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Manage your personal and professional information.
                    </p>
                </div>

                {!editing && (
                    <button
                        onClick={startEditing}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit Profile
                    </button>
                )}
            </div>

            {error && (
                <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
                    <CircleAlert className="h-5 w-5 shrink-0" />
                    {error}
                </div>
            )}

            {success && (
                <div role="status" className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    {success}
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="h-32 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 sm:h-40" />
                <div className="relative px-5 pb-6 sm:px-8">
                    <div className="-mt-12 flex flex-wrap items-end gap-5 sm:-mt-14">
                        <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">

                            {/* Doctor Profile Avatar */}
                            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-blue-100 text-3xl font-bold text-blue-800 shadow-md">

                                {photoLoading ? (
                                    <Loader2 className="h-7 w-7 animate-spin" />
                                ) : photoSrc ? (
                                    <img
                                        src={photoSrc}
                                        alt={`${profile.name} profile`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    initials || <UserRound className="h-10 w-10" />
                                )}

                            </div>

                            {/* Camera Button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={photoSaving}
                                title="Upload profile photo"
                                aria-label="Upload profile photo"
                                className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60"
                            >
                                {photoSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Camera className="h-4 w-4" />
                                )}
                            </button>

                            {/* Hidden File Input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handlePhotoUpload}
                                className="hidden"
                                aria-label="Select profile photo"
                            />

                        </div>

                        <div className="min-w-0 flex-1 pb-1">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {profile.name}
                            </h2>
                            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Stethoscope className="h-4 w-4 text-blue-600" />
                                {display(profile.specialization)}
                            </p>
                        </div>
                    </div>

                    {/* Profile Photo Actions */}
                    <div className="mt-5 flex flex-wrap items-center gap-3">

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={photoSaving}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                            {photoSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Camera className="h-4 w-4" />
                            )}

                            {photoSaving ? "Uploading..." : "Upload Photo"}
                        </button>

                        {profile.profileImageUrl && (
                            <button
                                type="button"
                                onClick={() => void handlePhotoRemove()}
                                disabled={photoSaving}
                                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                            >
                                <X className="h-4 w-4" />
                                Remove Photo
                            </button>
                        )}

    {/*                    <span className="text-xs font-medium text-slate-600">*/}
    {/*    JPG, PNG or WebP · Max 2 MB*/}
    {/*</span>*/}

                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">
              <BadgeCheck className="h-4 w-4" />
              Doctor Account
            </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800">
              <Mail className="h-4 w-4" />
                            {profile.email}
            </span>
                        {profile.city && (
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800">
                <MapPin className="h-4 w-4" />
                                {profile.city}
              </span>
                        )}
                    </div>
                </div>
            </div>

            {editing ? (
                <form onSubmit={saveProfile} className="space-y-6">
                    <Section
                        title="Personal Information"
                        description="Your basic contact details"
                        icon={UserRound}
                    >
                        <Field label="Full Name" field="name" />
                        <Field label="Phone Number" field="phone" type="tel" />
                        <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">
                Gender
              </span>
                            <select
                                value={form.gender ?? ""}
                                onChange={(event) => changeField("gender", event.target.value)}
                                className={inputClass}
                            >
                                <option value="">Select gender</option>
                                <option value="Female">Female</option>
                                <option value="Male">Male</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </label>
                        <Info label="Email (Read Only)" value={profile.email} />
                    </Section>

                    <Section
                        title="Professional Information"
                        description="Your medical qualifications and practice"
                        icon={BriefcaseMedical}
                    >
                        <Field label="Specialization" field="specialization" />
                        <Field label="Qualification" field="qualification" />
                        <Field label="Experience (Years)" field="experienceYears" type="number" />
                        <Field label="Consultation Fee (₹)" field="consultationFee" type="number" />
                        <Info
                            label="Registration Number (Read Only)"
                            value={profile.registrationNumber}
                        />

                    </Section>

                    <Section
                        title="Hospital & Location"
                        description="Where patients can find you"
                        icon={Building2}
                    >
                        <Field label="Hospital Name" field="hospitalName" />
                        <Field label="Address" field="address" />
                        <Field label="City" field="city" />
                        <Field label="State" field="state" />
                    </Section>

                    <div className="flex flex-wrap justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                        <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-6">
                    <Section
                        title="Personal Information"
                        description="Basic information and contact details"
                        icon={UserRound}
                    >
                        <Info label="Full Name" value={profile.name} />
                        <Info label="Email Address" value={profile.email} />
                        <Info label="Phone Number" value={profile.phone} />
                        <Info label="Gender" value={profile.gender} />
                    </Section>

                    <Section
                        title="Professional Information"
                        description="Qualifications and consultation details"
                        icon={GraduationCap}
                    >
                        <Info label="Specialization" value={profile.specialization} />
                        <Info label="Qualification" value={profile.qualification} />
                        <Info label="Experience (Years)" value={profile.experienceYears} />
                        <Info
                            label="Consultation Fee"
                            value={
                                profile.consultationFee === null
                                    ? null
                                    : `₹${profile.consultationFee.toLocaleString("en-IN")}`
                            }
                        />
                        <Info
                            label="Medical Registration Number"
                            value={profile.registrationNumber}
                        />
                        <Info label="Doctor ID" value={`#${profile.id}`} />
                    </Section>

                    <Section
                        title="Hospital & Location"
                        description="Practice location information"
                        icon={Building2}
                    >
                        <Info label="Hospital Name" value={profile.hospitalName} />
                        <Info label="Address" value={profile.address} />
                        <Info label="City" value={profile.city} />
                        <Info label="State" value={profile.state} />
                    </Section>

                    <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                        <ShieldCheck className="h-5 w-5 shrink-0 text-blue-700" />
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Account Information
                            </h3>
                            <p className="mt-1 text-sm text-slate-700">
                                Email and medical registration details are read-only.
                                Contact your hospital administrator for verified changes.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
