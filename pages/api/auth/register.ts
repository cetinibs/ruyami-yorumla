import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import connectDB from './config/mongodb';
import User from './models/user';

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

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    try {
      await Promise.race([
        connectDB(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('MongoDB connection timeout')), 10000)
        )
      ]);
    } catch (dbError: any) {
      console.error('MongoDB connection error:', dbError);
      res.status(503).json({
        success: false,
        error: 'Veritabanı bağlantı hatası',
        details: 'Veritabanına bağlanılamadı. Lütfen daha sonra tekrar deneyiniz.'
      });
      return;
    }

    // Check if user exists
    console.log('Checking existing user...');
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'Kullanıcı zaten mevcut',
        details: 'Bu email adresi ile kayıtlı bir kullanıcı bulunmaktadır'
      });
      return;
    }

    // Hash password
    console.log('Hashing password...');
    let hashedPassword;
    try {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      res.status(500).json({
        success: false,
        error: 'Şifre işleme hatası',
        details: 'Kayıt işlemi sırasında bir hata oluştu'
      });
      return;
    }

    // Create user
    console.log('Creating new user...');
    let user;
    try {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        createdAt: new Date()
      });
    } catch (createError: any) {
      console.error('User creation error:', createError);
      if (createError.code === 11000) {
        res.status(400).json({
          success: false,
          error: 'Kullanıcı zaten mevcut',
          details: 'Bu email adresi ile kayıtlı bir kullanıcı bulunmaktadır'
        });
        return;
      }
      throw createError;
    }

    console.log('User created successfully');
    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
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
