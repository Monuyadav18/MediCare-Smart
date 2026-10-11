const TOKEN_KEY = "medicare_token";

export function clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem("medicare_user_id");
    sessionStorage.removeItem("medicare_roles");
}

export function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(
            atob(
                token
                    .split(".")[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

        if (typeof payload.exp !== "number") {
            return true;
        }

        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
}

export function getValidToken(): string {
    const token = sessionStorage.getItem(TOKEN_KEY);

    if (!token || isTokenExpired(token)) {
        clearSession();
        window.location.replace("/login?session=expired");
        throw new Error("Your session has expired. Please login again.");
    }

    return token;
}

export function handleUnauthorized() {
    clearSession();
    window.location.replace("/login?session=expired");
}