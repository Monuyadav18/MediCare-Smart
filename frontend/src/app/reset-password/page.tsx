
"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080/api/v1";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    type TokenStatus =
        | "CHECKING"
        | "VALID"
        | "INVALID"
        | "EXPIRED"
        | "ALREADY_USED"
        | "ERROR";

    const [tokenStatus, setTokenStatus] = useState<TokenStatus>("CHECKING");


    useEffect(() => {
        if (!token) {
            return;
        }

        const controller = new AbortController();

        async function validateToken() {
            setTokenStatus("CHECKING");

            try {
                const response = await fetch(
                    `${API_URL}/auth/validate-reset-token?token=${encodeURIComponent(token)}`,
                    {
                        method: "GET",
                        signal: controller.signal,
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error("Token validation failed.");
                }

                const status = (await response.text()).trim();

                if (
                    status === "VALID" ||
                    status === "INVALID" ||
                    status === "EXPIRED" ||
                    status === "ALREADY_USED"
                ) {
                    setTokenStatus(status);
                } else {
                    setTokenStatus("ERROR");
                }
            } catch (err) {
                if (controller.signal.aborted) return;
                setTokenStatus("ERROR");
            }
        }

        validateToken();

        return () => controller.abort();
    }, [token]);


    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!token || tokenStatus !== "VALID") {
            setError("This reset link is invalid or no longer available.");
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

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    newPassword: password,
                }),
            });

            if (!response.ok) {
                if (response.status === 400 || response.status === 404) {
                    throw new Error(
                        "Invalid or expired reset link. Please request a new one."
                    );
                }

                throw new Error("Unable to reset password. Please try again.");
            }

            setSuccess("Password reset successfully!");
            setPassword("");
            setConfirmPassword("");

            setTokenStatus("ALREADY_USED");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                <div className="mb-7 text-center">
                    <div className="mb-3 text-3xl font-bold text-blue-700">
                        MediCare
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Reset Password
                    </h1>
                    <p className="mt-3 text-sm text-slate-700">
                        Enter your new password to secure your account.
                    </p>
                </div>


                {!token && (
                    <p
                        role="alert"
                        className="mb-5 rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-900"
                    >
                        Reset token missing. Please request a new reset link.
                    </p>
                )}

                {token && tokenStatus === "CHECKING" && (
                    <div
                        role="status"
                        className="mb-5 rounded-lg bg-blue-50 p-3 text-sm font-medium text-blue-900"
                    >
                        Validating your reset link...
                    </div>
                )}

                {!success &&
                    token &&
                    ["INVALID", "EXPIRED", "ALREADY_USED", "ERROR"].includes(tokenStatus) && (
                        <div
                            role="alert"
                            className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4"
                        >
                            <p className="font-semibold text-red-900">
                                {tokenStatus === "ALREADY_USED"
                                    ? "This reset link has already been used."
                                    : tokenStatus === "EXPIRED"
                                        ? "This reset link has expired."
                                        : tokenStatus === "INVALID"
                                            ? "This reset link is invalid."
                                            : "Unable to verify this reset link."}
                            </p>

                            <p className="mt-2 text-sm text-slate-800">
                                {tokenStatus === "ERROR"
                                    ? "Please try again later or request a new reset link."
                                    : "Please request a new password reset link to continue."}
                            </p>

                            <Link
                                href="/forgot-password"
                                className="mt-4 inline-flex rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                            >
                                Request New Reset Link
                            </Link>
                        </div>
                    )}


                {error && (
                    <p role="alert" className="mb-5 rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-800">
                        {error}
                    </p>
                )}

                {success && (
                    <div role="status" className="mb-5 rounded-lg border border-green-300 bg-green-50 p-3 text-sm font-medium text-green-900">
                        {success}
                        <Link href="/login" className="mt-2 block font-semibold text-blue-700 underline">
                            Go to Login
                        </Link>
                    </div>
                )}

                {!success && token && tokenStatus === "VALID" && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-900">
                                New Password
                            </label>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full rounded-lg border border-slate-400 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-900">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="w-full rounded-lg border border-slate-400 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={(e) => setShowPassword(e.target.checked)}
                                className="h-4 w-4 accent-blue-700"
                            />
                            Show passwords
                        </label>

                        <button
                            type="submit"
                            disabled={loading || !token}
                            className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-sm font-semibold text-blue-700 hover:underline">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<main className="flex min-h-screen items-center justify-center text-slate-900">Loading...</main>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
