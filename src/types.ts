export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
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

export interface TestCaseResult {
  test_case: TestCase;
  passed: boolean;
  actual_output: string;
  error_message?: string;
  execution_time: number;
}

export interface TestResult {
  passed: boolean;
  passed_test_cases: number;
  total_test_cases: number;
  pass_rate: number;
  total_execution_time: number;
  results: TestCaseResult[];
  feedback: string;
  time_complexity?: string;
  space_complexity?: string;
}

export interface InterviewSession {
  id: number;
  user_id: number;
  session_name: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  completed: boolean;
  avg_attention_level?: number;
  avg_positivity_level?: number;
  avg_arousal_level?: number;
  overall_assessment?: string;
  created_at: string;
  updated_at?: string;
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
  updated_at?: string;
  question?: Question;
} 