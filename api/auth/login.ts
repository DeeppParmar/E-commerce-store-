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
        const { email, password, fullName } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Create Supabase client with service key for admin operations
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Try to sign in first
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        // If sign in successful, return session
        if (!signInError && signInData.session) {
            return res.status(200).json({
                user: signInData.user,
                session: signInData.session,
                message: 'Signed in successfully'
            });
        }

        // If sign in failed, attempt to register (auto-registration)
        console.log('Sign in failed, attempting registration...', signInError?.message);

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName || email.split('@')[0],
                },
            },
        });

        if (signUpError) {
            // Check if it's a "user already exists" error
            if (signUpError.message.toLowerCase().includes('already registered')) {
                return res.status(400).json({ error: 'Incorrect password for existing account' });
            }
            throw signUpError;
        }

        // If signup successful
        if (signUpData.user) {
            if (signUpData.session) {
                return res.status(201).json({
                    user: signUpData.user,
                    session: signUpData.session,
                    message: 'Account created and signed in successfully'
                });
            } else {
                return res.status(201).json({
                    user: signUpData.user,
                    message: 'Account created. Please check your email to confirm.'
                });
            }
        }

        return res.status(500).json({ error: 'Authentication failed' });

    } catch (error: any) {
        console.error('Login error:', error);
        return res.status(500).json({
            error: error.message || 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
}
