
import { apiRequest } from "@/services/api";

import {
    LoginRequest,
    LoginResponse,
    SignUpRequest,
    SignupResponse,
} from "@/types/auth";

export const authService = {
    login: async (
        credentials: LoginRequest
    ): Promise<LoginResponse> => {
        return apiRequest<LoginResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        });
    },

    signup: async (
        data: SignUpRequest
    ): Promise<SignupResponse> => {
        return apiRequest<SignupResponse>("/auth/signup", {
            method: "POST",
            body: JSON.stringify({
                username: data.username.trim().toLowerCase(),
                password: data.password,
                name: data.name.trim(),
                roles: ["PATIENT"],
            }),
        });
    },
};
