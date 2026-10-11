
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080/api/v1";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!success) return;

        const timer = setTimeout(() => {
            setSuccess("");
        }, 2000);

        return () => clearTimeout(timer);
    }, [success]);


    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setSuccess("");

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setError("Please enter your email address.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/auth/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email: normalizedEmail }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to process your request. Please try again."
                );
            }

            setSuccess(
                "Password reset link has been sent."
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <div className="mb-3 text-3xl font-bold text-blue-700">
                        MediCare
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900">
                        Forgot Password?
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-slate-700">
                        Enter your registered email address and we will
                        send you a secure password reset link.
                    </p>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-800"
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        role="status"
                        className="mb-5 rounded-lg border border-green-300 bg-green-50 p-3 text-sm font-medium text-green-900"
                    >
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-semibold text-slate-900"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your registered email"
                            className="w-full rounded-lg border border-slate-400 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        href="/login"
                        className="text-sm font-semibold text-blue-700 hover:underline"
                    >
                        ← Back to Login
                    </Link>
                </div>

                <p className="mt-6 text-center text-xs text-slate-600">
                    © MediCare
                </p>
            </div>
        </main>
    );
}
