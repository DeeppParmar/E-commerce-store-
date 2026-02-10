import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No authorization token provided' });
        }

        const token = authHeader.substring(7);
        const { auction_id, amount } = req.body;

        if (!auction_id || !amount) {
            return res.status(400).json({ error: 'Auction ID and amount are required' });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Get user from token
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Call the place_bid database function
        const { data, error } = await supabase.rpc('place_bid', {
            auction_id,
            bid_amount: amount
        });

        if (error) {
            throw error;
        }

        return res.status(200).json({
            success: true,
            result: data
        });

    } catch (error: any) {
        console.error('Place bid error:', error);

        // Handle specific database errors
        if (error.message) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(500).json({
            error: error.message || 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
}
