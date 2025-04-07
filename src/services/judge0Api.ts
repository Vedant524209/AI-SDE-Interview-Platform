import axios from 'axios';

// Create an axios instance for Judge0 API
const judge0Api = axios.create({
  baseURL: 'http://localhost:8000/judge0',  // This points to our backend
  timeout: 60000, // Increase timeout to 60 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Language IDs for Judge0
export const LANGUAGE_IDS = {
  javascript: 63,  // JavaScript (Node.js 12.14.0)
  python: 71,     // Python (3.8.1)
  java: 62,       // Java (OpenJDK 13.0.1)
  cpp: 54,        // C++ (GCC 9.2.0)
};

// Status codes for Judge0
export const JUDGE0_STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR: 7,
  SERVER_ERROR: 8,
};

export interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
  enable_network?: boolean;
}

export interface Judge0Result {
  status: {
    id: number;
    description: string;
  };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: number | null;
  memory: number | null;
}

// Add delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simple in-memory cache for API responses
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute cache TTL

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // Increase retry delay to 2 seconds

// Rate limiting configuration
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // Increase minimum interval to 1 second

// Helper function to enforce rate limiting
const enforceRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await delay(waitTime);
  }
  
  lastRequestTime = Date.now();
};

// Helper function to validate submission token
const isValidToken = (token: string): boolean => {
  return Boolean(token && token.length > 0 && /^[a-zA-Z0-9-]+$/.test(token));
};

export const judge0Service = {
  // Execute code directly using Judge0
  executeCode: async (code: string, language: string, stdin: string = "", retryCount = 0): Promise<Judge0Result> => {
    try {
      // Enforce rate limiting
      await enforceRateLimit();
      
      console.log(`Executing ${language} code with Judge0`);
      
      // Get language ID
      const languageId = LANGUAGE_IDS[language as keyof typeof LANGUAGE_IDS] || LANGUAGE_IDS.python;
      
      // Create submission with additional parameters
      const submission: Judge0Submission = {
        source_code: code,
        language_id: languageId,
        stdin: stdin,
        cpu_time_limit: 5, // 5 seconds CPU time limit
        memory_limit: 512000, // 512MB memory limit
        enable_network: false as boolean // Explicitly type as boolean
      };
      
      const response = await judge0Api.post('/execute', submission);
      console.log('Judge0 execution result:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Failed to execute code with Judge0:', error);
      
      // Handle rate limiting and timeouts
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429 || error.code === 'ECONNABORTED') {
          if (retryCount < MAX_RETRIES) {
            const backoffDelay = RETRY_DELAY * Math.pow(2, retryCount);
            console.log(`Rate limited or timeout, retrying in ${backoffDelay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            await delay(backoffDelay);
            return judge0Service.executeCode(code, language, stdin, retryCount + 1);
          }
        }
      }
      
      throw error;
    }
  },
  
  // Get supported languages
  getLanguages: async (retryCount = 0): Promise<any[]> => {
    try {
      // Check cache first
      const cacheKey = 'languages';
      const cachedData = cache.get(cacheKey);
      
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
        console.log('Returning cached languages data');
        return cachedData.data;
      }
      
      // Enforce rate limiting
      await enforceRateLimit();
      
      console.log('Fetching supported languages from Judge0');
      const response = await judge0Api.get('/languages');
      console.log('Languages fetched successfully:', response.data);
      
      // Update cache
      cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      
      // Handle rate limiting and timeouts
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429 || error.code === 'ECONNABORTED') {
          if (retryCount < MAX_RETRIES) {
            const backoffDelay = RETRY_DELAY * Math.pow(2, retryCount);
            console.log(`Rate limited or timeout, retrying in ${backoffDelay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            await delay(backoffDelay);
            return judge0Service.getLanguages(retryCount + 1);
          }
        }
      }
      
      throw error;
    }
  },
  
  // Get submission status
  getSubmissionStatus: async (token: string, retryCount = 0): Promise<Judge0Result> => {
    try {
      // Validate token
      if (!isValidToken(token)) {
        throw new Error('Invalid submission token');
      }
      
      // Check cache first
      const cacheKey = `submission_${token}`;
      const cachedData = cache.get(cacheKey);
      
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
        console.log(`Returning cached submission status for token: ${token}`);
        return cachedData.data;
      }
      
      // Enforce rate limiting
      await enforceRateLimit();
      
      console.log(`Fetching submission status for token: ${token}`);
      const response = await judge0Api.get(`/submissions/${token}`);
      console.log('Submission status:', response.data);
      
      // Update cache
      cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch submission status for token ${token}:`, error);
      
      // Handle rate limiting and timeouts
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429 || error.code === 'ECONNABORTED') {
          if (retryCount < MAX_RETRIES) {
            const backoffDelay = RETRY_DELAY * Math.pow(2, retryCount);
            console.log(`Rate limited or timeout, retrying in ${backoffDelay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            await delay(backoffDelay);
            return judge0Service.getSubmissionStatus(token, retryCount + 1);
          }
        }
      }
      
      throw error;
    }
  }
}; 