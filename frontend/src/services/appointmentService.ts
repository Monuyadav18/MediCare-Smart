import { apiRequest } from "@/services/api";
import type {Appointment, AppointmentStatus,} from "@/types/appointment";


function getToken(): string {
    const token =
        sessionStorage.getItem("medicare_token");

    if (!token) {
        throw new Error(
            "Authentication token not found. Please login again."
        );
    }

    return token;
}

export const appointmentService = {

    // PATIENT - RESCHEDULE APPOINTMENT
    rescheduleAppointment: async (
        appointmentId: number,
        newSlotId: number
    ): Promise<Appointment> => {
        return apiRequest<Appointment>(
            `/patients/appointments/${appointmentId}/reschedule`,
            {
                method: "PATCH",
                token: getToken(),
                body: JSON.stringify({ newSlotId }),
            }
        );
    },

    // PATIENT - SELF CHECK-IN
    checkInAppointment: async (
        appointmentId: number
    ): Promise<Appointment> => {
        return apiRequest<Appointment>(
            `/patients/appointments/${appointmentId}/check-in`,
            {
                method: "PATCH",
                token: getToken(),
            }
        );
    },

    // =========================================================
    // DOCTOR APPOINTMENTS
    // =========================================================

    getDoctorAppointments:
        async (): Promise<Appointment[]> => {

            return apiRequest<Appointment[]>(
                "/doctors/appointments",
                {
                    method: "GET",
                    token: getToken(),
                }
            );
        },

    updateAppointmentStatus: async (
        appointmentId: number,
        status: AppointmentStatus
    ): Promise<Appointment> => {
        return apiRequest<Appointment>(
            `/doctors/appointments/${appointmentId}/status`,
            {
                method: "PATCH",
                token: getToken(),
                body: JSON.stringify({ status }),
            }
        );
    },

};