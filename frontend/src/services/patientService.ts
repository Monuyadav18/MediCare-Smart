import type { Appointment } from "@/types/appointment";
import {
    bookingService,
    type BookingSlot,
} from "@/services/bookingService";

import {
    getValidToken,
    handleUnauthorized,
} from "@/lib/auth";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080/api/v1";

export const patientService = {
    async getMyAppointments(): Promise<Appointment[]> {
        const token = getValidToken();

        const response = await fetch(
            `${API_URL}/patients/appointments`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        );

        if (response.status === 401) {
            handleUnauthorized();
            throw new Error("Session expired. Please login again.");
        }

        if (!response.ok) {
            throw new Error(
                `Unable to fetch appointments (${response.status})`
            );
        }

        return response.json();
    },
};