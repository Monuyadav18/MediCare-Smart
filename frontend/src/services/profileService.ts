
import { getValidToken, handleUnauthorized } from "@/lib/auth";
import type { Appointment } from "@/types/appointment";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export interface PatientProfile {
    id: number;
    name: string;
    email: string | null;
    gender: string | null;
    birthDate: string | null;
    bloodGroup: string | null;
}

export interface UpdatePatientProfile {
    name: string;
    gender: string | null;
    birthDate: string | null;
    bloodGroup: string | null;
}

// Common API request function
async function request<T>(
    path: string,
    method: "GET" | "PUT" | "PATCH",
    body?: UpdatePatientProfile
): Promise<T> {
    const token = getValidToken();

    const response = await fetch(`${API_URL}${path}`, {
        method,
        cache: "no-store",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (response.status === 401) {
        handleUnauthorized();
        throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
        let message = `Request failed (${response.status})`;

        try {
            const data = await response.json();
            message = data.message || data.error || message;
        } catch {
            // Use default error message
        }

        throw new Error(message);
    }

    return response.json() as Promise<T>;
}

// Patient Profile APIs
export const profileService = {
    getProfile: () =>
        request<PatientProfile>("/patients/profile", "GET"),

    updateProfile: (data: UpdatePatientProfile) =>
        request<PatientProfile>("/patients/profile", "PUT", data),
};

// Patient Appointment Cancellation API
export const cancellationService = {
    cancelAppointment: (appointmentId: number) =>
        request<Appointment>(
            `/patients/appointments/${appointmentId}/cancel`,
            "PATCH"
        ),
};
