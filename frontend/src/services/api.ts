import { clearSession, isTokenExpired } from "@/lib/auth";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api/v1";

interface ApiRequestOptions extends RequestInit {
    token?: string;
}

function redirectToLogin() {
    if (typeof window === "undefined") return;

    clearSession();

    if (window.location.pathname !== "/login") {
        window.location.replace("/login?session=expired");
    }
}

export async function apiRequest<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    const { token, headers, ...restOptions } = options;

    const isLoginRequest = endpoint === "/auth/login";

    // Check JWT expiry before protected API requests
    if (!isLoginRequest && token && isTokenExpired(token)) {
        redirectToLogin();

        throw new Error(
            "Your session has expired. Please login again."
        );
    }

    const requestHeaders = new Headers(headers);

    if (!requestHeaders.has("Content-Type") && restOptions.body) {
        requestHeaders.set("Content-Type", "application/json");
    }

    if (token) {
        requestHeaders.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...restOptions,
        headers: requestHeaders,
    });

    // Only handle authentication failure for protected requests
    if (response.status === 401 && !isLoginRequest && token) {
        redirectToLogin();

        throw new Error(
            "Your session has expired or is no longer valid. Please login again."
        );
    }

    if (!response.ok) {
        let errorMessage = `Request failed (${response.status}). Please try again.`;

        try {
            const errorData: {
                message?: string;
                error?: string;
            } = await response.json();

            if (
                typeof errorData.message === "string" &&
                errorData.message.trim()
            ) {
                errorMessage = errorData.message;
            } else if (
                typeof errorData.error === "string" &&
                errorData.error.trim()
            ) {
                errorMessage = errorData.error;
            }
        } catch {
            // Non-JSON or empty error response
        }

        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}