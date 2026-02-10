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
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No authorization token provided', user: null, session: null });
        }

        const token = authHeader.substring(7);

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) {
            throw error;
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid token', user: null, session: null });
        }

        return res.status(200).json({
            user,
            session: { access_token: token }
        });

    } catch (error: any) {
        console.error('Session error:', error);
        return res.status(401).json({
            error: error.message || 'Invalid session',
            user: null,
            session: null
        });
    }
}
