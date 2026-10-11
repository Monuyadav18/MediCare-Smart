
import { apiRequest } from "@/services/api";

import type {
    DoctorProfile,
    UpdateDoctorProfile,
} from "@/types/doctorProfile";

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080/api/v1"
).replace(/\/$/, "");

function getDoctorToken(): string {
    if (typeof window === "undefined") {
        throw new Error(
            "Authentication is only available in the browser."
        );
    }

    const token = sessionStorage.getItem("medicare_token");

    if (!token) {
        throw new Error("Please login to continue.");
    }

    return token;
}

export interface DoctorPhotoUploadResponse {
    message: string;
    profileImageUrl: string;
}

export const doctorProfileService = {

    // ============================================
    // GET DOCTOR PROFILE
    // ============================================
    getProfile: async (): Promise<DoctorProfile> => {
        return apiRequest<DoctorProfile>("/doctors/profile", {
            method: "GET",
            token: getDoctorToken(),
        });
    },

    // ============================================
    // UPDATE DOCTOR PROFILE
    // ============================================
    updateProfile: async (
        data: UpdateDoctorProfile
    ): Promise<DoctorProfile> => {
        return apiRequest<DoctorProfile>("/doctors/profile", {
            method: "PUT",
            token: getDoctorToken(),
            body: JSON.stringify(data),
        });
    },

    // ============================================
    // UPLOAD DOCTOR PROFILE PHOTO
    // ============================================
    uploadPhoto: async (
        file: File
    ): Promise<DoctorPhotoUploadResponse> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
            `${API_URL}/doctors/profile/photo`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${getDoctorToken()}`,
                },
                body: formData,
            }
        );

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Session expired. Please login again.");
            }

            if (response.status === 403) {
                throw new Error("You are not authorized to upload photos.");
            }

            if (response.status === 413) {
                throw new Error("Image size must not exceed 2 MB.");
            }

            throw new Error(
                `Unable to upload profile photo (${response.status}).`
            );
        }

        return response.json() as Promise<DoctorPhotoUploadResponse>;
    },

    // ============================================
    // GET PROFILE PHOTO WITH JWT
    // ============================================
    getPhotoBlob: async (
        photoUrl: string
    ): Promise<Blob> => {
        if (!/^\/doctors\/profile\/photo\/[a-f0-9-]{36}\.(jpg|png|webp)$/i.test(photoUrl)) {
            throw new Error("Invalid profile photo URL.");
        }

        const response = await fetch(
            `${API_URL}${photoUrl}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${getDoctorToken()}`,
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error(
                `Unable to load profile photo (${response.status}).`
            );
        }

        return response.blob();
    },

    // ============================================
    // DELETE DOCTOR PROFILE PHOTO
    // ============================================
    deletePhoto: async (): Promise<void> => {
        const response = await fetch(
            `${API_URL}/doctors/profile/photo`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${getDoctorToken()}`,
                },
            }
        );

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Session expired. Please login again.");
            }

            if (response.status === 403) {
                throw new Error("You are not authorized to remove photos.");
            }

            throw new Error(
                `Unable to remove profile photo (${response.status}).`
            );
        }
    },
};
