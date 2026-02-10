// API client for making requests to the backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        // Try to load token from localStorage
        this.token = localStorage.getItem('access_token');
    }

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('access_token', token);
        } else {
            localStorage.removeItem('access_token');
        }
    }

    getToken() {
        return this.token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    }

    // Auth endpoints
    async login(email: string, password: string, fullName?: string) {
        const data = await this.request<{
            user: any;
            session: { access_token: string };
            message: string;
        }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, fullName }),
        });

        if (data.session?.access_token) {
            this.setToken(data.session.access_token);
        }

        return data;
    }

    async logout() {
        try {
            await this.request('/api/auth/logout', { method: 'POST' });
        } finally {
            this.setToken(null);
        }
    }

    async getSession() {
        try {
            const data = await this.request<{
                user: any;
                session: { access_token: string };
            }>('/api/auth/session');
            return data;
        } catch (error) {
            this.setToken(null);
            return { user: null, session: null };
        }
    }

    // Auctions endpoints
    async getAuctions(status: string = 'active') {
        return this.request<{ auctions: any[] }>(
            `/api/auctions/index?status=${status}`
        );
    }

    async getAuction(id: string) {
        return this.request<{ auction: any }>(`/api/auctions/${id}`);
    }

    async createAuction(data: {
        title: string;
        description?: string;
        images?: string[];
        starting_price: number;
        end_time: string;
    }) {
        return this.request<{ auction: any; message: string }>(
            '/api/auctions/create',
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        );
    }

    // Bids endpoints
    async placeBid(auction_id: string, amount: number) {
        return this.request<{ success: boolean; result: any }>('/api/bids/place', {
            method: 'POST',
            body: JSON.stringify({ auction_id, amount }),
        });
    }

    // Profile endpoints
    async getProfile() {
        return this.request<{ profile: any }>('/api/profile/me');
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
