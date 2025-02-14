import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../config/mongodb';
import DreamQuery from '../../../models/DreamQuery';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth middleware
const authenticate = (req: NextApiRequest): Promise<string> => {
  return new Promise((resolve, reject) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reject(new Error('No token provided'));
    }

    const token = authHeader?.split(' ')[1];
    
    jwt.verify(token as string, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        reject(new Error('Invalid token'));
      }
      resolve(decoded.userId);
    });
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectDB();
    const userId = await authenticate(req);

    switch (req.method) {
      case 'GET':
        // Get user's dream queries
        const dreams = await DreamQuery.find({ userId })
          .sort({ createdAt: -1 })
          .select('dreamText interpretation createdAt');
        return res.status(200).json(dreams);

      case 'POST':
        // Save new dream query
        const { dreamText, interpretation } = req.body;
        
        if (!dreamText || !interpretation) {
          return res.status(400).json({ error: 'Rüya metni ve yorumu gereklidir' });
        }

        const dreamQuery = await DreamQuery.create({
          userId,
          dreamText,
          interpretation,
        });

        return res.status(201).json(dreamQuery);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Dreams API error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
