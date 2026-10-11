import type { Appointment } from "@/types/appointment";
import { getValidToken, handleUnauthorized } from "@/lib/auth";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080/api/v1";

export interface BookingDoctor {
    id: number;
    name: string;
    specialization: string | null;
    email: string | null;
}

export interface BookingSlot {
    id: number;
    doctorId: number;
    startTime: string;
    endTime: string;
    maxCapacity: number;
    bookedCount: number;
    availableSeats: number;
}

async function authorizedRequest<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getValidToken();

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
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
            // Response may not contain JSON
        }

        throw new Error(message);
    }

    return response.json() as Promise<T>;
}

export const bookingService = {
    searchDoctors(search = "") {
        return authorizedRequest<BookingDoctor[]>(
            `/patients/doctors/search?search=${encodeURIComponent(search)}`
        );
    },

    getDoctorSlots(doctorId: number, date: string) {
        return authorizedRequest<BookingSlot[]>(
            `/patients/doctors/${doctorId}/slots?date=${encodeURIComponent(date)}`
        );
    },

    createAppointment(slotId: number, reason: string) {
        return authorizedRequest<Appointment>(
            "/patients/appointments",
            {
                method: "POST",
                body: JSON.stringify({ slotId, reason }),
            }
        );
    },
};