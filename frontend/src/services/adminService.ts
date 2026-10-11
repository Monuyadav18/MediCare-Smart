import { apiRequest } from "@/services/api";
import { AdminDashboardSummary } from "@/types/admin";
import {
    CreateDoctorRequest,
    Doctor,
} from "@/types/doctor";

function getAdminToken(): string {
    const token = sessionStorage.getItem("medicare_token");

    if (!token) {
        throw new Error(
            "Authentication token not found. Please login again."
        );
    }

    return token;
}

export const adminService = {
    getDashboardSummary:
        async (): Promise<AdminDashboardSummary> => {
            return apiRequest<AdminDashboardSummary>(
                "/admin/dashboard",
                {
                    method: "GET",
                    token: getAdminToken(),
                }
            );
        },

    getDoctors: async (): Promise<Doctor[]> => {
        return apiRequest<Doctor[]>("/admin/doctors", {
            method: "GET",
            token: getAdminToken(),
        });
    },

    createDoctor: async (
        data: CreateDoctorRequest
    ): Promise<Doctor> => {
        return apiRequest<Doctor>("/admin/doctors", {
            method: "POST",
            token: getAdminToken(),
            body: JSON.stringify(data),
        });
    },
};