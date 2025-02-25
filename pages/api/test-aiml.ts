import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// AIML API configuration
const AIML_API_KEY = process.env.AIML_API_KEY || 'aa93527f72624e9aa8a803d6dc9f7fbb';
const AIML_API_URL = 'https://api.aimlapi.com/chat/completions';

type ApiResponse = {
  status?: string;
  error?: string;
  details?: any;
  apiKey?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('AIML API test request received');
  console.log('API Key:', AIML_API_KEY ? `${AIML_API_KEY.substring(0, 5)}...` : 'not available');
  console.log('API URL:', AIML_API_URL);

  try {
    // Simple test message
    const response = await axios.post(
      AIML_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello!' }
        ],
        temperature: 0.7,
        max_tokens: 100
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AIML_API_KEY}`
        }
      }
    );

    console.log('AIML API response:', response.data);

    return res.status(200).json({
      status: 'success',
      details: {
        model: 'gpt-3.5-turbo',
        response: response.data.choices[0].message.content
      },
      apiKey: `${AIML_API_KEY.substring(0, 5)}...${AIML_API_KEY.substring(AIML_API_KEY.length - 3)}`
    });
  } catch (error) {
    console.error('AIML API test error:', error);
    
    let errorDetails = 'Unknown error';
    if (error.response) {
      errorDetails = {
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.message) {
      errorDetails = error.message;
    }
    
    return res.status(500).json({
      status: 'error',
      error: 'AIML API test failed',
      details: errorDetails,
      apiKey: `${AIML_API_KEY.substring(0, 5)}...${AIML_API_KEY.substring(AIML_API_KEY.length - 3)}`
    });
  }
}
