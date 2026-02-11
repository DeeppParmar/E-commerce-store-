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
        const { status = 'active' } = req.query;

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Fetch auctions with bid count
        const { data: auctions, error: auctionsError } = await supabase
            .from('auctions')
            .select(`
        *,
        seller:profiles!seller_id (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
            .eq('status', status)
            .order('end_time', { ascending: true });

        if (auctionsError) {
            throw auctionsError;
        }

        // Get bid counts for each auction
        const auctionIds = auctions?.map(a => a.id) || [];

        if (auctionIds.length > 0) {
            const { data: bidCounts, error: bidsError } = await supabase
                .from('bids')
                .select('auction_id')
                .in('auction_id', auctionIds);

            if (bidsError) {
                throw bidsError;
            }

            // Count bids per auction
            const bidCountMap: Record<string, number> = {};
            bidCounts?.forEach(bid => {
                bidCountMap[bid.auction_id] = (bidCountMap[bid.auction_id] || 0) + 1;
            });

            // Add bid count to each auction
            const auctionsWithBids = auctions?.map(auction => ({
                ...auction,
                bid_count: bidCountMap[auction.id] || 0
            }));

            return res.status(200).json({ auctions: auctionsWithBids });
        }

        return res.status(200).json({ auctions: auctions || [] });

    } catch (error: any) {
        console.error('Auctions fetch error:', error);
        return res.status(500).json({
            error: error.message || 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
}
