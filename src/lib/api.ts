/**
 * Simple fetch wrapper to mimic axios interface
 */
const server = {
    get: async (url: string, config?: { params?: Record<string, string | number | boolean | undefined | null> }) => {
        let finalUrl = url;
        if (config?.params) {
            const params = new URLSearchParams();
            Object.entries(config.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
            finalUrl += `?${params.toString()}`;
        }
        const response = await fetch(finalUrl);
        const data = await response.json();
        return { data, status: response.status, ok: response.ok };
    },

    post: async (url: string, body?: unknown) => {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return { data, status: response.status, ok: response.ok };
    },

    put: async (url: string, body?: unknown) => {
        const response = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return { data, status: response.status, ok: response.ok };
    },

    patch: async (url: string, body?: unknown) => {
        const response = await fetch(url, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return { data, status: response.status, ok: response.ok };
    },

    delete: async (url: string) => {
        const response = await fetch(url, {
            method: "DELETE",
        });
        const data = await response.json();
        return { data, status: response.status, ok: response.ok };
    },
};

export default server;
