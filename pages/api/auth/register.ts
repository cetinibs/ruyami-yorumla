import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../config/mongodb';
import User from '../../../models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Tüm alanlar gereklidir' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email adresi zaten kayıtlı' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
    });

    // Remove password from response
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
    };

    res.status(201).json(userResponse);
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Kayıt işlemi başarısız oldu' });
  }
}
