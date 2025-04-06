import axios from 'axios';

// Create an axios instance with base URL and config
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000 // 30 seconds
});

// Define TypeScript interfaces for data structures
export interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Question {
  id: number;
  title: string;
  desc: string;
  difficulty: string;
  example: Example;
  constraints: string[];
  topics: string[];
  test_cases: TestCase[];
  created_at: string;
  updated_at?: string;
  attention_level?: number;
  positivity_level?: number;
  arousal_level?: number;
  dominant_emotion?: string;
}

export interface CodeSubmission {
  code: string;
  language?: string;
}

export interface TestCaseResult {
  passed: boolean;
  test_case: TestCase;
  actual_output: string;
  execution_time: number;
  error_message?: string;
}

export interface TestResult {
  passed: boolean;
  passed_test_cases: number;
  total_test_cases: number;
  results: TestCaseResult[];
  feedback: string;
  time_complexity: string;
  space_complexity: string;
}

export interface EmotionAnalysisResult {
  attention_level: number;
  positivity_level: number;
  arousal_level: number;
  dominant_emotion: string;
  face_detected: boolean;
  error?: string;
}

export interface UserState {
  attention_level: number;
  positivity_level: number;
  arousal_level: number;
  dominant_emotion: 'happy' | 'confident' | 'neutral' | 'uncomfortable';
}

// API service functions
export const questionApi = {
  // Generate a new question with specified difficulty
  generateQuestion: async (difficulty: string, userState?: UserState): Promise<Question> => {
    try {
      console.log('Sending request to generate new question with difficulty:', difficulty);
      const response = await api.post('/questions/', {
        difficulty,
        user_state: userState
      });
      console.log('Question generated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to generate question:', error);
      throw error;
    }
  },

  // Get a specific question by ID
  getQuestion: async (id: number): Promise<Question> => {
    try {
      console.log('Fetching question with ID:', id);
      const response = await api.get(`/questions/${id}`);
      console.log('Question fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch question with ID ${id}:`, error);
      throw error;
    }
  },

  // Get all available questions
  getAllQuestions: async (): Promise<Question[]> => {
    try {
      console.log('Fetching all questions');
      const response = await api.get('/questions/');
      console.log('Questions fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      throw error;
    }
  },

  // Test code submission for a question
  testCode: async (questionId: number, code: string, language: string = 'javascript'): Promise<TestResult> => {
    try {
      console.log(`Testing code submission for question ${questionId}`);
      const submission: CodeSubmission = {
        code,
        language
      };
      const response = await api.post(`/questions/${questionId}/test`, submission);
      console.log('Code test results:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to test code:', error);
      throw error;
    }
  },

  // Analyze emotion from an image
  analyzeEmotion: async (imageData: string): Promise<EmotionAnalysisResult> => {
    try {
      console.log('Sending request to analyze emotion');
      const response = await api.post('/analyze-emotion/', {
        image: imageData
      });
      console.log('Emotion analysis results:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to analyze emotion:', error);
      throw error;
    }
  },

  // Log user state
  logUserState: async (userState: UserState): Promise<{ message: string; id: number }> => {
    try {
      console.log('Sending request to log user state');
      const response = await api.post('/user-state/', userState);
      console.log('User state logged successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to log user state:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async (): Promise<{ status: string }> => {
    try {
      console.log('Sending health check request to:', api.defaults.baseURL + '/health');
      const response = await api.get('/health');
      console.log('Health check response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API health check failed:', error);
      throw error;
    }
  }
};

// Add global interceptors for debugging
api.interceptors.request.use(request => {
  console.log('API Request:', request.method?.toUpperCase(), request.url);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('API Error:', 
      error.response?.status || 'Network Error', 
      error.config?.url,
      error.message
    );
    return Promise.reject(error);
  }
);

export default questionApi; 