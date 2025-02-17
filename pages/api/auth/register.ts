import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import connectDB from '../../../config/mongodb';
import User from '../../../models/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Eksik bilgi',
        details: 'İsim, email ve şifre gereklidir'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Geçersiz şifre',
        details: 'Şifre en az 6 karakter olmalıdır'
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        error: 'Geçersiz isim',
        details: 'İsim en az 2 karakter olmalıdır'
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        error: 'Geçersiz email',
        details: 'Lütfen geçerli bir email adresi giriniz'
      });
    }

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await Promise.race([
      connectDB(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('MongoDB connection timeout')), 10000)
      )
    ]);
    console.log('MongoDB connected successfully');

    // Check if user exists
    console.log('Checking existing user...');
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(400).json({
        error: 'Kullanıcı zaten mevcut',
        details: 'Bu email adresi ile kayıtlı bir kullanıcı bulunmaktadır'
      });
    }

    // Hash password
    console.log('Hashing password...');
    let hashedPassword;
    try {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      return res.status(500).json({
        error: 'Şifre işleme hatası',
        details: 'Kayıt işlemi sırasında bir hata oluştu'
      });
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
        return res.status(400).json({
          error: 'Kullanıcı zaten mevcut',
          details: 'Bu email adresi ile kayıtlı bir kullanıcı bulunmaktadır'
        });
      }
      throw createError;
    }

    console.log('User created successfully');
    return res.status(201).json({
      message: 'Kayıt başarılı',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);

    // MongoDB connection error
    if (error.message?.includes('MongoDB connection timeout')) {
      return res.status(503).json({
        error: 'Veritabanı bağlantı hatası',
        details: 'Lütfen daha sonra tekrar deneyiniz'
      });
    }

    // Validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Doğrulama hatası',
        details: Object.values(error.errors).map((err: any) => err.message).join(', ')
      });
    }

    return res.status(500).json({
      error: 'Sunucu hatası',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Kayıt işlemi başarısız oldu'
    });
  }
}
