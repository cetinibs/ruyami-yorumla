import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

type ResponseData = {
  success: boolean;
  error?: string;
  data?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
    return;
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email ve şifre gerekli'
      });
      return;
    }

    console.log('Attempting login with:', { email });
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        error: error.message === 'Invalid login credentials'
          ? 'Geçersiz email veya şifre'
          : error.message
      });
      return;
    }

    if (!data?.user || !data?.session) {
      console.error('No user or session data:', data);
      res.status(500).json({
        success: false,
        error: 'Giriş başarısız. Lütfen tekrar deneyin.'
      });
      return;
    }

    console.log('Login successful:', { user: data.user });
    res.status(200).json({
      success: true,
      data: {
        user: data.user,
        session: data.session
      }
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
    });
  }
}
