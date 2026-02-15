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
        const {
            title, description, images, starting_price, end_time,
            category, condition, min_increment, tags,
            shipping_cost, seller_location, local_pickup,
            reserve_price, buy_now_price
        } = req.body;

        if (!title || !starting_price || !end_time) {
            return res.status(400).json({ error: 'Title, starting price, and end time are required' });
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

        // Create auction with all fields
        const { data: auction, error: auctionError } = await supabase
            .from('auctions')
            .insert({
                seller_id: user.id,
                title,
                description: description || null,
                images: images || [],
                starting_price,
                current_price: starting_price,
                end_time,
                status: 'active',
                category: category || 'Other',
                condition: condition || 'good',
                min_increment: min_increment || 10,
                tags: tags || [],
                shipping_cost: shipping_cost || 0,
                seller_location: seller_location || null,
                local_pickup: local_pickup || false,
                reserve_price: reserve_price || null,
                buy_now_price: buy_now_price || null,
                thumbnail_url: images?.[0] || null
            })
            .select()
            .single();

        if (auctionError) {
            throw auctionError;
        }

        return res.status(201).json({
            auction,
            message: 'Auction created successfully'
        });

    } catch (error: any) {
        console.error('Create auction error:', error);
        return res.status(500).json({
            error: error.message || 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
}
