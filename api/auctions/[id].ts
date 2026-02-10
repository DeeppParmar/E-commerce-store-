import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'Auction ID is required' });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Fetch auction details
        const { data: auction, error: auctionError } = await supabase
            .from('auctions')
            .select(`
        *,
        seller:profiles!seller_id (
          id,
          email,
          full_name,
          avatar_url
        ),
        winner:profiles!winner_id (
          id,
          email,
          full_name
        )
      `)
            .eq('id', id)
            .single();

        if (auctionError) {
            if (auctionError.code === 'PGRST116') {
                return res.status(404).json({ error: 'Auction not found' });
            }
            throw auctionError;
        }

        // Fetch bids for this auction
        const { data: bids, error: bidsError } = await supabase
            .from('bids')
            .select(`
        *,
        bidder:profiles!bidder_id (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
            .eq('auction_id', id)
            .order('created_at', { ascending: false });

        if (bidsError) {
            throw bidsError;
        }

        return res.status(200).json({
            auction: {
                ...auction,
                bids,
                bid_count: bids?.length || 0
            }
        });

    } catch (error: any) {
        console.error('Auction fetch error:', error);
        return res.status(500).json({
            error: error.message || 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
}
