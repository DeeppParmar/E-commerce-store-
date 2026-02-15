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

        const userId = user.id;

        // Active bids count (auctions I bid on that are still active)
        const { count: activeBidsCount } = await supabase
            .from('bids')
            .select('auction_id', { count: 'exact', head: true })
            .eq('bidder_id', userId);

        // My active auctions count
        const { count: myAuctionsCount } = await supabase
            .from('auctions')
            .select('id', { count: 'exact', head: true })
            .eq('seller_id', userId)
            .eq('status', 'active');

        // Currently winning count — auctions where I'm the current winner
        const { count: winningCount } = await supabase
            .from('auctions')
            .select('id', { count: 'exact', head: true })
            .eq('winner_id', userId)
            .eq('status', 'active');

        // Total won (completed)
        const { count: wonCount } = await supabase
            .from('auction_winners')
            .select('id', { count: 'exact', head: true })
            .eq('winner_id', userId);

        // Total spent
        const { data: spentData } = await supabase
            .from('auction_winners')
            .select('winning_bid')
            .eq('winner_id', userId);

        const totalSpent = (spentData || []).reduce((sum: number, r: any) => sum + (parseFloat(r.winning_bid) || 0), 0);

        // Watchlist count
        const { count: watchlistCount } = await supabase
            .from('watchlist')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);

        // Unread notifications
        const { count: unreadNotifications } = await supabase
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        // Total earned (as seller)
        const { data: earnedData } = await supabase
            .from('auction_winners')
            .select('winning_bid, auction:auctions!inner(seller_id)')
            .eq('auction.seller_id', userId);

        const totalEarned = (earnedData || []).reduce((sum: number, r: any) => sum + (parseFloat(r.winning_bid) || 0), 0);

        return res.status(200).json({
            summary: {
                active_bids: activeBidsCount || 0,
                my_auctions: myAuctionsCount || 0,
                currently_winning: winningCount || 0,
                auctions_won: wonCount || 0,
                total_spent: totalSpent,
                total_earned: totalEarned,
                watchlist_count: watchlistCount || 0,
                unread_notifications: unreadNotifications || 0
            }
        });
    } catch (error: any) {
        console.error('Dashboard summary error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
