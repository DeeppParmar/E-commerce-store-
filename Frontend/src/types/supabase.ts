export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    role: 'user' | 'seller' | 'admin'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: 'user' | 'seller' | 'admin'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: 'user' | 'seller' | 'admin'
                    created_at?: string
                    updated_at?: string
                }
            }
            auctions: {
                Row: {
                    id: string
                    seller_id: string
                    title: string
                    description: string | null
                    images: string[] | null
                    starting_price: number
                    current_price: number
                    start_time: string
                    end_time: string
                    status: 'active' | 'ended' | 'cancelled'
                    winner_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    seller_id: string
                    title: string
                    description?: string | null
                    images?: string[] | null
                    starting_price: number
                    current_price?: number
                    start_time?: string
                    end_time: string
                    status?: 'active' | 'ended' | 'cancelled'
                    winner_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    seller_id?: string
                    title?: string
                    description?: string | null
                    images?: string[] | null
                    starting_price?: number
                    current_price?: number
                    start_time?: string
                    end_time?: string
                    status?: 'active' | 'ended' | 'cancelled'
                    winner_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            bids: {
                Row: {
                    id: string
                    auction_id: string
                    bidder_id: string
                    amount: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    auction_id: string
                    bidder_id: string
                    amount: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    auction_id?: string
                    bidder_id?: string
                    amount?: number
                    created_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    type: 'outbid' | 'won' | 'ended' | 'system' | null
                    message: string
                    related_id: string | null
                    is_read: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type?: 'outbid' | 'won' | 'ended' | 'system' | null
                    message: string
                    related_id?: string | null
                    is_read?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: 'outbid' | 'won' | 'ended' | 'system' | null
                    message?: string
                    related_id?: string | null
                    is_read?: boolean | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            place_bid: {
                Args: {
                    auction_id: string
                    bid_amount: number
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
