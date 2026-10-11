
"use client";

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";

interface DoctorAvatarProps {
    doctorId: number;
    name: string;
    className?: string;
}

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080/api/v1"
).replace(/\/$/, "");

export default function DoctorAvatar({
                                         doctorId,
                                         name,
                                         className = "h-14 w-14",
                                     }: DoctorAvatarProps) {
    const [photoSrc, setPhotoSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        let objectUrl: string | null = null;

        async function loadPhoto() {
            setLoading(true);
            setPhotoSrc(null);

            try {
                const token = sessionStorage.getItem("medicare_token");

                if (!token) return;

                const response = await fetch(
                    `${API_URL}/doctors/${doctorId}/photo`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        cache: "no-store",
                    }
                );

                if (!response.ok) return;

                const blob = await response.blob();

                if (!active) return;

                objectUrl = URL.createObjectURL(blob);
                setPhotoSrc(objectUrl);
            } catch (error) {
                console.error("Doctor photo load error:", error);
            } finally {
                if (active) setLoading(false);
            }
        }

        void loadPhoto();

        return () => {
            active = false;

            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [doctorId]);

    const initial = name
        .replace(/^Dr\.?\s*/i, "")
        .trim()
        .charAt(0)
        .toUpperCase();

    return (
        <div
            className={`relative shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 ${className}`}
        >
            {photoSrc ? (
                <img
                    src={photoSrc}
                    alt={`${name} profile photo`}
                    className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                    {loading ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                        initial || <UserRound className="h-7 w-7" />
                    )}
                </div>
            )}
        </div>
    );
}
