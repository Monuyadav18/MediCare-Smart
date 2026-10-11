import { apiRequest } from "@/services/api";

import {
    AppointmentSlot,
    CreateDoctorAvailabilityRequest,
    DoctorDashboardSummary,
} from "@/types/doctor";
import type { Appointment } from "@/types/appointment";

function getDoctorToken(): string {
    const token =
        sessionStorage.getItem("medicare_token");

    if (!token) {
        throw new Error(
            "Authentication token not found. Please login again."
        );
    }

    return token;
}

export const doctorService = {

    // =========================================================
    // DASHBOARD
    // =========================================================

    getDashboardSummary:
        async (): Promise<DoctorDashboardSummary> => {

            return apiRequest<DoctorDashboardSummary>(
                "/doctors/dashboard",
                {
                    method: "GET",
                    token: getDoctorToken(),
                }
            );
        },


    // =========================================================
    // CREATE AVAILABILITY
    // =========================================================

    createAvailability:
        async (
            data: CreateDoctorAvailabilityRequest
        ): Promise<AppointmentSlot[]> => {

            return apiRequest<AppointmentSlot[]>(
                "/doctors/availability",
                {
                    method: "POST",
                    token: getDoctorToken(),
                    body: JSON.stringify(data),
                }
            );
        },

    getAvailability: async (
        date: string
    ): Promise<AppointmentSlot[]> => {

        return apiRequest<AppointmentSlot[]>(
            `/doctors/availability?date=${encodeURIComponent(date)}`,
            {
                method: "GET",
                token: getDoctorToken(),
            }
        );
    },

    // =========================================================
// DOCTOR LIVE QUEUE
// =========================================================

    getLiveQueue: (date: string): Promise<Appointment[]> =>
        apiRequest<Appointment[]>(
            `/doctors/queue?date=${encodeURIComponent(date)}`,
            {
                method: "GET",
                token: getDoctorToken(),
            }
        ),
};
