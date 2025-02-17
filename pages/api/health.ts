import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import connectDB from '../../config/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // MongoDB bağlantı durumunu kontrol et
    await Promise.race([
      connectDB(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB connection timeout')), 5000))
    ]);

    // Environment variables kontrolü
    const envCheck = {
      mongodb_uri: !!process.env.MONGODB_URI,
      jwt_secret: !!process.env.JWT_SECRET,
      gemini_api_key: !!process.env.GEMINI_API_KEY
    };

    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        host: mongoose.connection.host
      },
      environment: envCheck
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
}
