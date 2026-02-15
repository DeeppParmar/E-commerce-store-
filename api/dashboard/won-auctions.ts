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

        const { data: wonAuctions } = await supabase
            .from('auction_winners')
            .select(`
                id,
                winning_bid,
                created_at,
                payment_status,
                shipped,
                auction:auctions (
                    id,
                    title,
                    images,
                    description,
                    seller_id
                )
            `)
            .eq('winner_id', user.id)
            .order('created_at', { ascending: false });

        return res.status(200).json({ won_auctions: wonAuctions || [] });
    } catch (error: any) {
        console.error('Won auctions error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
