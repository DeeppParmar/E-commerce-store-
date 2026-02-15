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

        const type = (req.query.type as string) || 'summary';

        // ─── SUMMARY ───
        if (type === 'summary') {
            const [
                { count: activeBidsCount },
                { count: myAuctionsCount },
                { count: winningCount },
                { count: wonCount },
                { data: spentData },
                { count: watchlistCount },
                { count: unreadNotifications },
                { data: earnedData }
            ] = await Promise.all([
                supabase.from('bids').select('auction_id', { count: 'exact', head: true }).eq('bidder_id', user.id),
                supabase.from('auctions').select('id', { count: 'exact', head: true }).eq('seller_id', user.id).eq('status', 'active'),
                supabase.from('auctions').select('id', { count: 'exact', head: true }).eq('winner_id', user.id).eq('status', 'active'),
                supabase.from('auction_winners').select('id', { count: 'exact', head: true }).eq('winner_id', user.id),
                supabase.from('auction_winners').select('winning_bid').eq('winner_id', user.id),
                supabase.from('watchlist').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
                supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false),
                supabase.from('auction_winners').select('winning_bid, auction:auctions!inner(seller_id)').eq('auction.seller_id', user.id)
            ]);

            const totalSpent = (spentData || []).reduce((sum: number, r: any) => sum + (parseFloat(r.winning_bid) || 0), 0);
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
        }

        // ─── ACTIVE BIDS ───
        if (type === 'active-bids') {
            const { data: userBids } = await supabase
                .from('bids')
                .select('auction_id, amount, created_at')
                .eq('bidder_id', user.id)
                .order('created_at', { ascending: false });

            if (!userBids || userBids.length === 0) {
                return res.status(200).json({ bids: [] });
            }

            const auctionIds = [...new Set(userBids.map(b => b.auction_id))];

            const { data: auctions } = await supabase
                .from('auctions')
                .select('id, title, images, current_price, end_time, status, winner_id, starting_price, min_increment')
                .in('id', auctionIds)
                .eq('status', 'active');

            const activeBids = (auctions || []).map((auction: any) => {
                const myBids = userBids.filter(b => b.auction_id === auction.id);
                const myHighestBid = Math.max(...myBids.map(b => parseFloat(b.amount)));

                return {
                    auction_id: auction.id,
                    title: auction.title,
                    image: auction.images?.[0] || null,
                    current_price: parseFloat(auction.current_price),
                    my_highest_bid: myHighestBid,
                    end_time: auction.end_time,
                    status: auction.status,
                    is_winning: auction.winner_id === user.id,
                    bid_count: myBids.length,
                    min_increment: parseFloat(auction.min_increment || '10')
                };
            });

            return res.status(200).json({ bids: activeBids });
        }

        // ─── WON AUCTIONS ───
        if (type === 'won') {
            const { data: wonAuctions } = await supabase
                .from('auction_winners')
                .select(`
                    id, winning_bid, created_at, payment_status, shipped,
                    auction:auctions (id, title, images, description, seller_id)
                `)
                .eq('winner_id', user.id)
                .order('created_at', { ascending: false });

            return res.status(200).json({ won_auctions: wonAuctions || [] });
        }

        return res.status(400).json({ error: 'Invalid type. Use: summary, active-bids, or won' });
    } catch (error: any) {
        console.error('Dashboard error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
