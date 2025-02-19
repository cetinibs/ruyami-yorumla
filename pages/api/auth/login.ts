import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

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

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email ve şifre gereklidir'
      });
    }

    console.log('Attempting login for email:', email);

    // Attempt to sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        return res.status(401).json({
          success: false,
          error: 'Geçersiz email veya şifre'
        });
      }

      if (error.message.includes('Email not confirmed')) {
        return res.status(401).json({
          success: false,
          error: 'Email adresinizi onaylamanız gerekiyor'
        });
      }

      return res.status(401).json({
        success: false,
        error: error.message
      });
    }

    if (!data.user || !data.session) {
      return res.status(500).json({
        success: false,
        error: 'Giriş işlemi başarısız oldu'
      });
    }

    console.log('Login successful for user:', data.user.id);

    // Return user data and session token
    return res.status(200).json({
      success: true,
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name
      }
    });

  } catch (error) {
    console.error('Unexpected login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Giriş işlemi sırasında bir hata oluştu'
    });
  }
}
