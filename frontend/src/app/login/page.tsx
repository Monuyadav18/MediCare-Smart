"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
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
} from "lucide-react";

import { authService } from "@/services/authService";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get("session") === "expired") {
            setError(
                "Your login session has expired. Please sign in again to continue."
            );

            window.history.replaceState(null, "", "/login");
        }
        if (params.get("registered") === "true") {
            setSuccess("Account created successfully! Please sign in.");
            window.history.replaceState(null, "", "/login");
        }
    }, []);


    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        window.history.replaceState(null, "", "/login");

        // Username validation
        if (!username.trim()) {
            setError("Please enter your username.");
            return;
        }

        // Password validation
        if (!password) {
            setError("Please enter your password.");
            return;
        }

        try {
            setLoading(true);

            // Backend login API call
            const response = await authService.login({
                username: username.trim(),
                password,
            });

            // Validate backend response
            if (!response.jwt) {
                throw new Error("Authentication token not received.");
            }

            if (!response.roles || response.roles.length === 0) {
                throw new Error("No role assigned to this account.");
            }

            // Store authentication information
            sessionStorage.setItem(
                "medicare_token",
                response.jwt
            );

            sessionStorage.setItem(
                "medicare_user_id",
                String(response.userId)
            );

            sessionStorage.setItem(
                "medicare_roles",
                JSON.stringify(response.roles)
            );

            /*
             * Role Priority
             *
             * ADMIN   -> Admin Dashboard
             * DOCTOR  -> Doctor Dashboard
             * PATIENT -> Patient Dashboard
             */

            if (response.roles.includes("ADMIN")) {
                window.location.href = "/admin/dashboard";
                return;
            }

            if (response.roles.includes("DOCTOR")) {
                window.location.href = "/doctor/dashboard";
                return;
            }

            if (response.roles.includes("PATIENT")) {
                window.location.href = "/patient/dashboard";
                return;
            }

            setError(
                "Your account does not have permission to access a dashboard."
            );
        } catch (err) {
            console.error("LOGIN ERROR:", err);

            const message =
                err instanceof Error ? err.message : "";

            const normalizedMessage = message.toLowerCase();

            if (
                normalizedMessage.includes("authentication failed") ||
                normalizedMessage.includes("no value present") ||
                normalizedMessage.includes("bad credentials") ||
                normalizedMessage.includes("invalid credentials") ||
                normalizedMessage.includes("incorrect username or password")
            ) {
                setError(
                    "Incorrect username or password. Please try again."
                );
            } else if (
                normalizedMessage.includes("failed to fetch") ||
                normalizedMessage.includes("networkerror")
            ) {
                setError(
                    "Unable to connect to the server. Please try again later."
                );
            } else {
                setError(
                    "Unable to sign in right now. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-50">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />

                <div className="absolute -bottom-40 right-0 h-[450px] w-[450px] rounded-full bg-cyan-200/40 blur-3xl" />
            </div>

            <div className="relative grid min-h-screen lg:grid-cols-2">
                {/* LEFT SECTION */}

                <motion.section
                    initial={{
                        opacity: 0,
                        x: -30,
                    }}
                    animate={{
                        opacity: 1,
                        x: 0,
                    }}
                    transition={{
                        duration: 0.7,
                    }}
                    className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16"
                >
                    {/* Decorative circles */}

                    <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[50px] border-white/5" />

                    <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full border-[60px] border-white/5" />

                    {/* Logo */}

                    <Link
                        href="/"
                        className="relative z-10 flex w-fit items-center gap-3"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                            <HeartPulse className="h-7 w-7" />
                        </div>

                        <div>
                            <p className="text-2xl font-bold">
                                MediCare
                            </p>

                            <p className="text-xs text-blue-100">
                                Smart Healthcare Platform
                            </p>
                        </div>
                    </Link>

                    {/* Main content */}

                    <div className="relative z-10 max-w-xl">
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.2,
                                duration: 0.6,
                            }}
                        >
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
                                <Stethoscope className="h-8 w-8" />
                            </div>

                            <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
                                Healthcare made
                                <br />
                                simple for everyone.
                            </h1>

                            <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100">
                                Access appointments, doctors and
                                healthcare services from one secure
                                platform.
                            </p>
                        </motion.div>

                        <div className="mt-10 space-y-4">
                            {[
                                "Book doctor appointments easily",
                                "Track your appointment queue",
                                "Manage healthcare in one place",
                            ].map((feature, index) => (
                                <motion.div
                                    key={feature}
                                    initial={{
                                        opacity: 0,
                                        x: -20,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                    }}
                                    transition={{
                                        delay:
                                            0.35 + index * 0.12,
                                    }}
                                    className="flex items-center gap-3"
                                >
                                    <CheckCircle2 className="h-5 w-5 text-cyan-200" />

                                    <span className="text-blue-50">
                    {feature}
                  </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom security */}

                    <div className="relative z-10 flex items-center gap-3 text-sm text-blue-100">
                        <ShieldCheck className="h-5 w-5" />

                        <span>
              Secure authentication powered by MediCare
            </span>
                    </div>
                </motion.section>

                {/* RIGHT SECTION */}

                <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 25,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.6,
                            delay: 0.1,
                        }}
                        className="w-full max-w-md"
                    >
                        {/* Mobile logo */}

                        <div className="mb-10 flex items-center justify-between lg:hidden">
                            <Link
                                href="/"
                                className="flex items-center gap-2"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                                    <HeartPulse className="h-6 w-6 text-white" />
                                </div>

                                <span className="text-xl font-bold">
                  Medi
                  <span className="text-blue-600">
                    Care
                  </span>
                </span>
                            </Link>
                        </div>

                        {/* Back */}

                        <Link
                            href="/"
                            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to home
                        </Link>

                        {/* Heading */}

                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                                Welcome Back
                            </p>

                            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                                Sign in to MediCare
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                                Enter your account details to continue
                                to your healthcare dashboard.
                            </p>
                        </div>

                        {/* Form */}

                        <form
                            onSubmit={handleSubmit}
                            className="mt-9 space-y-5"
                        >
                            {/* Username */}

                            <div>
                                <label
                                    htmlFor="username"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Username
                                </label>

                                <div className="group relative">
                                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />

                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(event) =>
                                            setUsername(
                                                event.target.value
                                            )
                                        }
                                        autoComplete="username"
                                        placeholder="Enter your username"
                                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            {/* Password */}

                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-semibold text-slate-700"
                                    >
                                        Password
                                    </label>

                                    <Link
                                        href="/forgot-password"
                                        className="text-xs font-semibold text-blue-700 transition-colors hover:text-blue-900 hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <div className="group relative">
                                    <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value
                                            )
                                        }
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (previous) =>
                                                    !previous
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-blue-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}

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
                                    className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Login button */}

                            <motion.button
                                whileHover={{
                                    y: -2,
                                }}
                                whileTap={{
                                    scale: 0.98,
                                }}
                                type="submit"
                                disabled={loading}
                                className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In

                                        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Signup */}

                        <p className="mt-8 text-center text-sm text-slate-500">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/signup"
                                className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
                            >
                                Create account
                            </Link>
                        </p>

                        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                            <ShieldCheck className="h-4 w-4" />
                            Secure & protected authentication
                        </div>
                    </motion.div>
                </section>
            </div>
        </main>
    );
}