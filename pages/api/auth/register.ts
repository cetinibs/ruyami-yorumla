import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      details: 'Only POST method is allowed'
    });
    return;
  }

  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Eksik bilgi',
        details: 'İsim, email ve şifre gereklidir'
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Geçersiz şifre',
        details: 'Şifre en az 6 karakter olmalıdır'
      });
      return;
    }

    if (name.length < 2) {
      res.status(400).json({
        success: false,
        error: 'Geçersiz isim',
        details: 'İsim en az 2 karakter olmalıdır'
      });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Geçersiz email',
        details: 'Lütfen geçerli bir email adresi giriniz'
      });
      return;
    }

    // Register user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        }
      }
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        error: 'Kayıt hatası',
        details: authError.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      user: {
        id: authData.user.id,
        name: authData.user.user_metadata.name,
        email: authData.user.email
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);

    // Validation error
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: 'Doğrulama hatası',
        details: Object.values(error.errors).map((err: any) => err.message).join(', ')
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Sunucu hatası',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Kayıt işlemi başarısız oldu'
    });
  }
}
