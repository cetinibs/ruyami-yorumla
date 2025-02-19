import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET method for now
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header missing'
      });
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get dreams from Supabase
    const { data: dreams, error: dreamsError } = await supabase
      .from('dreams')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (dreamsError) {
      console.error('Dreams fetch error:', dreamsError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch dreams'
      });
    }

    // If no dreams found, return empty array
    if (!dreams) {
      return res.status(200).json([]);
    }

    // Return dreams
    return res.status(200).json(dreams);

  } catch (error) {
    console.error('Unexpected error in dreams endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
