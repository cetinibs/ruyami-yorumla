import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'aa93527f72624e9aa8a803d6dc9f7fbb';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Mock API response for testing
const useMockApi = true; // Set to false in production

// Mock function to simulate OpenAI API response
async function getMockOpenAIResponse(): Promise<any> {
  console.log('Using mock OpenAI API response');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    status: 200,
    data: {
      choices: [
        {
          message: {
            content: "Hello! This is a mock response from the OpenAI API."
          }
        }
      ]
    }
  };
}

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

  console.log('OpenAI API test request received');
  console.log('API Key:', OPENAI_API_KEY ? `${OPENAI_API_KEY.substring(0, 5)}...` : 'not available');
  console.log('API URL:', OPENAI_API_URL);
  console.log('Using Mock API:', useMockApi);

  try {
    let response;
    
    if (useMockApi) {
      response = await getMockOpenAIResponse();
    } else {
      // Simple test message
      response = await axios.post(
        OPENAI_API_URL,
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
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );
    }

    console.log('OpenAI API response:', response.data);

    return res.status(200).json({
      status: 'success',
      details: {
        model: 'gpt-3.5-turbo',
        response: response.data.choices[0].message.content,
        mockApi: useMockApi
      },
      apiKey: `${OPENAI_API_KEY.substring(0, 5)}...${OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 3)}`
    });
  } catch (error) {
    console.error('OpenAI API test error:', error);
    
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
      error: 'OpenAI API test failed',
      details: errorDetails,
      apiKey: `${OPENAI_API_KEY.substring(0, 5)}...${OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 3)}`
    });
  }
}
