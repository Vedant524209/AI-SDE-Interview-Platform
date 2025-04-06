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

// New interview session interfaces
export interface InterviewSession {
  id: number;
  user_id?: number;
  session_name?: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  completed: boolean;
  avg_attention_level?: number;
  avg_positivity_level?: number;
  avg_arousal_level?: number;
  overall_assessment?: string;
  created_at: string;
}

export interface SessionQuestion {
  id: number;
  session_id: number;
  question_id: number;
  order_index: number;
  code_submitted?: string;
  language?: string;
  passed_tests?: number;
  total_tests?: number;
  test_results?: any;
  start_time: string;
  end_time?: string;
  duration?: number;
  created_at: string;
}

export interface EmotionSnapshot {
  id: number;
  session_id: number;
  timestamp: string;
  attention_level: number;
  positivity_level: number;
  arousal_level: number;
  dominant_emotion: string;
  face_detected: boolean;
  question_id?: number;
}

export interface InterviewSessionWithDetails extends InterviewSession {
  session_questions: SessionQuestion[];
  emotion_snapshots: EmotionSnapshot[];
}

export interface EmotionSummary {
  attention_level?: number;
  positivity_level?: number;
  arousal_level?: number;
  dominant_emotions: Record<string, number>;
  snapshot_count: number;
}

// Report interfaces
export interface SessionReport {
  session_info: {
    id: number;
    session_name?: string;
    start_time?: string;
    end_time?: string;
    duration?: number;
    completed: boolean;
  };
  question_performance: {
    question_id: number;
    title: string;
    difficulty: string;
    topics: string[];
    time_spent: number;
    language?: string;
    test_results: {
      passed?: number;
      total?: number;
      pass_rate: number;
    };
    code_quality: {
      readability: number;
      efficiency: number;
      correctness: number;
      overall: number;
    };
  }[];
  emotional_analysis: {
    average: {
      attention_level?: number;
      positivity_level?: number;
      arousal_level?: number;
    };
    assessment?: string;
    emotion_distribution: Record<string, number>;
  };
  overall_assessment: {
    problem_solving_score?: number;
    code_quality_score?: number;
    emotional_state_score?: number;
    overall_score?: number;
    strengths: string[];
    areas_for_improvement: string[];
    recommendations: string[];
  };
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

// Session management API
export const sessionApi = {
  // Create a new interview session
  createSession: async (userId?: number, sessionName?: string): Promise<InterviewSession> => {
    try {
      console.log('Creating new interview session');
      const response = await api.post('/sessions/', { 
        user_id: userId, 
        session_name: sessionName 
      });
      console.log('Session created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  },

  // Get session details by ID
  getSession: async (sessionId: number): Promise<InterviewSessionWithDetails> => {
    try {
      console.log(`Fetching session with ID: ${sessionId}`);
      const response = await api.get(`/sessions/${sessionId}`);
      console.log('Session fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch session with ID ${sessionId}:`, error);
      throw error;
    }
  },

  // Update a session
  updateSession: async (sessionId: number, sessionData: Partial<InterviewSession>): Promise<InterviewSession> => {
    try {
      console.log(`Updating session with ID: ${sessionId}`);
      const response = await api.put(`/sessions/${sessionId}`, sessionData);
      console.log('Session updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update session with ID ${sessionId}:`, error);
      throw error;
    }
  },

  // Delete a session
  deleteSession: async (sessionId: number): Promise<{ message: string }> => {
    try {
      console.log(`Deleting session with ID: ${sessionId}`);
      const response = await api.delete(`/sessions/${sessionId}`);
      console.log('Session deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete session with ID ${sessionId}:`, error);
      throw error;
    }
  },

  // Add a question to a session
  addQuestionToSession: async (
    sessionId: number, 
    questionId: number, 
    orderIndex: number = 0
  ): Promise<SessionQuestion> => {
    try {
      console.log(`Adding question ${questionId} to session ${sessionId}`);
      const response = await api.post(`/sessions/${sessionId}/questions/`, {
        question_id: questionId,
        order_index: orderIndex
      });
      console.log('Question added to session successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to add question to session:`, error);
      throw error;
    }
  },

  // Update a question in a session
  updateSessionQuestion: async (
    sessionId: number,
    questionId: number,
    questionData: Partial<SessionQuestion>
  ): Promise<SessionQuestion> => {
    try {
      console.log(`Updating question ${questionId} in session ${sessionId}`);
      const response = await api.put(`/sessions/${sessionId}/questions/${questionId}`, questionData);
      console.log('Session question updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update session question:`, error);
      throw error;
    }
  },

  // Add emotion snapshot to a session
  addEmotionSnapshot: async (
    sessionId: number,
    emotionData: Omit<EmotionSnapshot, 'id' | 'session_id' | 'timestamp'>
  ): Promise<EmotionSnapshot> => {
    try {
      console.log(`Adding emotion snapshot to session ${sessionId}`);
      const response = await api.post(`/sessions/${sessionId}/emotions/`, emotionData);
      console.log('Emotion snapshot added successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to add emotion snapshot:`, error);
      throw error;
    }
  },

  // Get emotion snapshots for a session
  getSessionEmotions: async (
    sessionId: number,
    limit: number = 100,
    offset: number = 0
  ): Promise<EmotionSnapshot[]> => {
    try {
      console.log(`Fetching emotions for session ${sessionId}`);
      const response = await api.get(`/sessions/${sessionId}/emotions/?limit=${limit}&offset=${offset}`);
      console.log('Session emotions fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch session emotions:`, error);
      throw error;
    }
  },

  // Get emotion summary for a session
  getSessionEmotionSummary: async (sessionId: number): Promise<EmotionSummary> => {
    try {
      console.log(`Fetching emotion summary for session ${sessionId}`);
      const response = await api.get(`/sessions/${sessionId}/emotions/summary`);
      console.log('Session emotion summary fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch session emotion summary:`, error);
      throw error;
    }
  },

  // Get session report
  getSessionReport: async (sessionId: number): Promise<SessionReport> => {
    try {
      console.log(`Generating report for session ${sessionId}`);
      const response = await api.get(`/sessions/${sessionId}/report`);
      console.log('Session report generated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to generate report for session ${sessionId}:`, error);
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