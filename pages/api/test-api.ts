import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

// DeepSeek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL_NAME = 'deepseek-chat';

// Initialize Gemini API only if API key is available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;

type ApiResponse = {
  deepseekStatus?: string;
  geminiStatus?: string;
  deepseekError?: string;
  geminiError?: string;
  env?: {
    hasDeepseekKey: boolean;
    hasGeminiKey: boolean;
  };
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

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      deepseekError: 'Method not allowed',
      geminiError: 'Method not allowed'
    });
  }

  const response: ApiResponse = {
    env: {
      hasDeepseekKey: !!DEEPSEEK_API_KEY,
      hasGeminiKey: !!GEMINI_API_KEY
    }
  };

  // Test DeepSeek API
  if (DEEPSEEK_API_KEY) {
    try {
      const deepseekResponse = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: DEEPSEEK_MODEL_NAME,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant.'
            },
            {
              role: 'user',
              content: 'Hello!'
            }
          ],
          temperature: 0.7,
          max_tokens: 100
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
          },
          timeout: 10000 // 10 seconds timeout
        }
      );
      
      response.deepseekStatus = 'OK';
    } catch (error) {
      response.deepseekError = error.message;
      if (error.response) {
        response.deepseekError += ` | Status: ${error.response.status} | Data: ${JSON.stringify(error.response.data)}`;
      }
    }
  } else {
    response.deepseekError = 'DeepSeek API key is missing';
  }

  // Test Gemini API
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const result = await model.generateContent('Hello!');
      
      response.geminiStatus = 'OK';
    } catch (error) {
      response.geminiError = error.message;
    }
  } else {
    response.geminiError = 'Gemini API key is missing';
  }

  return res.status(200).json(response);
}
