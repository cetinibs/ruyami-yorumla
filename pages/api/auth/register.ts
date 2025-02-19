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
    console.log('Registration attempt for email:', email);

    // Input validation
    if (!name || !email || !password) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password });
      res.status(400).json({
        success: false,
        error: 'Eksik bilgi',
        details: 'İsim, email ve şifre gereklidir'
      });
      return;
    }

    if (password.length < 6) {
      console.log('Password too short');
      res.status(400).json({
        success: false,
        error: 'Geçersiz şifre',
        details: 'Şifre en az 6 karakter olmalıdır'
      });
      return;
    }

    if (name.length < 2) {
      console.log('Name too short');
      res.status(400).json({
        success: false,
        error: 'Geçersiz isim',
        details: 'İsim en az 2 karakter olmalıdır'
      });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      console.log('Invalid email');
      res.status(400).json({
        success: false,
        error: 'Geçersiz email',
        details: 'Lütfen geçerli bir email adresi girin'
      });
      return;
    }

    console.log('Attempting Supabase signup...');

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
      console.error('Supabase signup error:', authError);
      
      // Handle rate limiting error
      if (authError.message.includes('security purposes') || authError.message.includes('30 seconds')) {
        return res.status(429).json({
          success: false,
          error: 'Çok fazla deneme',
          details: 'Lütfen 30 saniye bekleyip tekrar deneyin'
        });
      }

      // Handle email already registered
      if (authError.message.includes('already registered')) {
        return res.status(400).json({
          success: false,
          error: 'Email zaten kayıtlı',
          details: 'Bu email adresi ile daha önce kayıt olunmuş'
        });
      }

      return res.status(400).json({
        success: false,
        error: 'Kayıt hatası',
        details: authError.message
      });
    }

    if (!authData.user) {
      console.error('No user data returned from Supabase');
      return res.status(500).json({
        success: false,
        error: 'Kayıt hatası',
        details: 'Kullanıcı kaydı oluşturulamadı'
      });
    }

    console.log('User registered successfully:', authData.user.id);
    return res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      user: {
        id: authData.user.id,
        name: authData.user.user_metadata.name,
        email: authData.user.email
      }
    });

  } catch (error) {
    console.error('Unexpected registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Sunucu hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu'
    });
  }
}
