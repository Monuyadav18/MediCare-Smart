
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    HeartPulse,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Stethoscope,
    UserRound,
} from "lucide-react";

import { authService } from "@/services/authService";

export default function SignupPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const inputClass =
        "h-13 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-950 placeholder:text-slate-500 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");

        if (name.trim().length < 2) {
            setError("Please enter your full name.");
            return;
        }

        const email = username.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            await authService.signup({
                name: name.trim(),
                username: email,
                password,
                roles: ["PATIENT"],
            });

            router.push("/login?registered=true");
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "";

            if (
                message.toLowerCase().includes("already exists") ||
                message.toLowerCase().includes("duplicate")
            ) {
                setError(
                    "This email is already registered. Please sign in."
                );
            } else {
                setError(
                    message || "Unable to create your account."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-50">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
                <div className="absolute -bottom-40 right-0 h-[450px] w-[450px] rounded-full bg-cyan-200/40 blur-3xl" />
            </div>

            <div className="relative grid min-h-screen lg:grid-cols-2">
                <motion.section
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16"
                >
                    <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[50px] border-white/5" />
                    <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full border-[60px] border-white/5" />

                    <Link
                        href="/"
                        className="relative z-10 flex w-fit items-center gap-3"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                            <HeartPulse className="h-7 w-7" />
                        </div>

                        <div>
                            <p className="text-2xl font-bold">MediCare</p>
                            <p className="text-xs text-blue-100">
                                Smart Healthcare Platform
                            </p>
                        </div>
                    </Link>

                    <div className="relative z-10 max-w-xl">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15">
                            <Stethoscope className="h-8 w-8" />
                        </div>

                        <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
                            Your health journey
                            <br />
                            starts here.
                        </h1>

                        <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100">
                            Join MediCare to find trusted doctors,
                            book appointments and manage your
                            healthcare experience.
                        </p>

                        <div className="mt-10 space-y-4">
                            {[
                                "Discover healthcare specialists",
                                "Book appointments in a few clicks",
                                "Track your appointments and queue",
                                "Manage your patient profile",
                            ].map((feature) => (
                                <div
                                    key={feature}
                                    className="flex items-center gap-3"
                                >
                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-200" />
                                    <span className="text-blue-50">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-3 text-sm text-blue-100">
                        <ShieldCheck className="h-5 w-5" />
                        Secure patient registration
                    </div>
                </motion.section>

                <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full max-w-md"
                    >
                        <div className="mb-8 lg:hidden">
                            <Link
                                href="/"
                                className="flex items-center gap-2"
                            >
                                <HeartPulse className="h-8 w-8 text-blue-600" />
                                <span className="text-2xl font-bold text-slate-950">
                                    Medi<span className="text-blue-600">Care</span>
                                </span>
                            </Link>
                        </div>

                        <Link
                            href="/"
                            className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to home
                        </Link>

                        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-600">
                            Get Started
                        </p>

                        <h2 className="text-3xl font-bold text-slate-950 sm:text-4xl">
                            Create your account
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-slate-700">
                            Register as a patient to access MediCare services.
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-semibold text-slate-800"
                                >
                                    Full Name
                                </label>

                                <div className="relative">
                                    <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />

                                    <input
                                        id="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder="Enter your full name"
                                        className={`${inputClass} h-14 pl-12`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-slate-800"
                                >
                                    Email Address
                                </label>

                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />

                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={username}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        placeholder="example@email.com"
                                        className={`${inputClass} h-14 pl-12`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-semibold text-slate-800"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />

                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Minimum 8 characters"
                                        className={`${inputClass} h-14 pl-12 pr-12`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        aria-label="Toggle password visibility"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-2 block text-sm font-semibold text-slate-800"
                                >
                                    Confirm Password
                                </label>

                                <div className="relative">
                                    <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />

                                    <input
                                        id="confirmPassword"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        placeholder="Re-enter your password"
                                        className={`${inputClass} h-14 pl-12 pr-12`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        aria-label="Toggle confirm password visibility"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800"
                                >
                                    {error}
                                </div>
                            )}

                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
                            >
                                {loading ? (
                                    "Creating Account..."
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        <p className="mt-7 text-center text-sm font-medium text-slate-700">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-bold text-blue-700 hover:underline"
                            >
                                Sign In
                            </Link>
                        </p>

                        <div className="mt-7 flex items-center justify-center gap-2 text-xs font-medium text-slate-600">
                            <ShieldCheck className="h-4 w-4" />
                            Your account is protected
                        </div>
                    </motion.div>
                </section>
            </div>
        </main>
    );
}
