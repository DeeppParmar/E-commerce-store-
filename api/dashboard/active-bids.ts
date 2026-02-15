import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No authorization token provided' });
        }

        const token = authHeader.substring(7);
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) return res.status(401).json({ error: 'Invalid token' });

        // Get distinct auctions user has bid on that are still active
        const { data: userBids } = await supabase
            .from('bids')
            .select('auction_id, amount, created_at')
            .eq('bidder_id', user.id)
            .order('created_at', { ascending: false });

        if (!userBids || userBids.length === 0) {
            return res.status(200).json({ bids: [] });
        }

        // Get unique auction IDs
        const auctionIds = [...new Set(userBids.map(b => b.auction_id))];

        // Get auction details
        const { data: auctions } = await supabase
            .from('auctions')
            .select('id, title, images, current_price, end_time, status, winner_id, starting_price, min_increment')
            .in('id', auctionIds)
            .eq('status', 'active');

        // Map bids with auction info and winning status
        const activeBids = (auctions || []).map((auction: any) => {
            const myBids = userBids.filter(b => b.auction_id === auction.id);
            const myHighestBid = Math.max(...myBids.map(b => parseFloat(b.amount)));
            const isWinning = auction.winner_id === user.id;

            return {
                auction_id: auction.id,
                title: auction.title,
                image: auction.images?.[0] || null,
                current_price: parseFloat(auction.current_price),
                my_highest_bid: myHighestBid,
                end_time: auction.end_time,
                status: auction.status,
                is_winning: isWinning,
                bid_count: myBids.length,
                min_increment: parseFloat(auction.min_increment || '10')
            };
        });

        return res.status(200).json({ bids: activeBids });
    } catch (error: any) {
        console.error('Active bids error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
