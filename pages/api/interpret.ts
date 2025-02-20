import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to sanitize interpretation text
function sanitizeInterpretation(text: string): string {
  return text
    .replace(/[^\w\s.,!?-]/g, '') // Remove special characters except basic punctuation
    .replace(/\s+/g, ' ')         // Replace multiple spaces with single space
    .trim();                      // Remove leading/trailing whitespace
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('API request received:', {
    method: req.method,
    body: req.body
  });

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
    return res.status(200).json({});
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    // Validate request body
    if (!req.body) {
      return res.status(400).json({
        error: 'Request body is required'
      });
    }

    const { dream } = req.body;

    if (!dream || typeof dream !== 'string') {
      return res.status(400).json({
        error: 'Dream text is required'
      });
    }

    if (dream.length > 1000) {
      return res.status(400).json({
        error: 'Dream text is too long (max 1000 characters)'
      });
    }

    // Example interpretation (replace with your actual interpretation logic)
    const interpretation = `
    1. Genel Yorum
    Bu rüya, günlük yaşamınızdaki deneyimlerin ve duygusal durumunuzun bir yansıması olabilir.

    2. Psikolojik Analiz
    Rüyanız, iç dünyanızda işlenmemiş duyguları ve düşünceleri temsil ediyor olabilir.

    3. Semboller ve Anlamları
    Rüyanızda görülen semboller, yaşamınızdaki önemli unsurları temsil ediyor olabilir.

    4. Öneriler
    Bu rüya, kendinizi daha iyi anlamanız için bir fırsat olabilir.`;

    // Sanitize interpretation
    const sanitizedInterpretation = sanitizeInterpretation(interpretation);

    // Save to database if user is authenticated
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          await supabase
            .from('dreams')
            .insert([
              {
                user_id: user.id,
                dream_text: dream.trim(),
                interpretation: sanitizedInterpretation,
              }
            ]);
        }
      } catch (error) {
        console.error('Database error:', error);
        // Continue even if database save fails
      }
    }

    // Always return a valid JSON response
    return res.status(200).json({
      interpretation: sanitizedInterpretation
    });

  } catch (error: any) {
    console.error('API error:', error);
    
    // Ensure we always return a valid JSON response
    return res.status(500).json({
      error: 'An error occurred while processing your request'
    });
  }
}
