import axios from 'axios';
import { InterviewSession, SessionQuestion } from '../types';

// Create an axios instance for the session API
const sessionClient = axios.create({
  baseURL: 'http://localhost:8000/sessions',
  timeout: 30000 // 30 seconds
});

export const sessionApi = {
  // Get a session by ID
  getSession: async (id: number): Promise<InterviewSession> => {
    try {
      const response = await sessionClient.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get session with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new session
  createSession: async (sessionName: string): Promise<InterviewSession> => {
    try {
      const response = await sessionClient.post('/', { session_name: sessionName });
      return response.data;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  },
  
  // Update a session
  updateSession: async (id: number, data: Partial<InterviewSession>): Promise<InterviewSession> => {
    try {
      const response = await sessionClient.put(`/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update session with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Add a question to a session
  addQuestionToSession: async (sessionId: number, questionId: number, orderIndex: number): Promise<SessionQuestion> => {
    try {
      const response = await sessionClient.post(`/${sessionId}/questions/`, {
        question_id: questionId,
        order_index: orderIndex
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to add question ${questionId} to session ${sessionId}:`, error);
      throw error;
    }
  },
  
  // Update a session question
  updateSessionQuestion: async (sessionId: number, questionId: number, data: Partial<SessionQuestion>): Promise<SessionQuestion> => {
    try {
      const response = await sessionClient.put(`/${sessionId}/questions/${questionId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update question ${questionId} in session ${sessionId}:`, error);
      throw error;
    }
  },
  
  // Get session questions
  getSessionQuestions: async (sessionId: number): Promise<SessionQuestion[]> => {
    try {
      const response = await sessionClient.get(`/${sessionId}/questions`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get questions for session ${sessionId}:`, error);
      throw error;
    }
  }
}; 