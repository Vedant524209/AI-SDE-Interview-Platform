import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Paper, Divider, Chip, Button, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Alert, List, ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TimerIcon from '@mui/icons-material/Timer';
import { useNavigate, useLocation } from 'react-router-dom';
import CodeEditor from './CodeEditor';
import Navbar from './Navbar';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmotionAnalysis from './EmotionAnalysis';
import { questionApi, Question, TestCase, Example, sessionApi, TestResult } from '../services/api';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import CircleIcon from '@mui/icons-material/Circle';

interface InterviewSessionProps {
  onLogout: () => void;
}

// Mock question data - fallback if API fails
const mockQuestion: Question = {
  id: 1,
  title: "Two Sum",
  desc: "Given an array of integers nums and an integer target, return indices of the two numbers in nums such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
  difficulty: "easy",
  example: {
    input: "nums = [2,7,11,15], target = 9",
    output: "[0,1]",
    explanation: "Because nums[0] + nums[1] = 2 + 7 = 9, we return [0, 1]."
  },
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists",
    "Expected time complexity: O(n)",
    "Expected space complexity: O(n)"
  ],
  topics: ["Array", "Hash Table"],
  test_cases: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "nums[0] + nums[1] = 2 + 7 = 9"
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "nums[1] + nums[2] = 2 + 4 = 6"
    },
    {
      input: "nums = [3,3], target = 6",
      output: "[0,1]",
      explanation: "nums[0] + nums[1] = 3 + 3 = 6"
    }
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  attention_level: 0.8,
  positivity_level: 0.7,
  arousal_level: 0.6,
  dominant_emotion: "neutral"
};

// Function to extract query parameters from URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const InterviewSession: React.FC<InterviewSessionProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const query = useQuery();
  const questionId = query.get('questionId');
  
  const [timeLeft, setTimeLeft] = useState<number>(45 * 60); // 45 minutes in seconds
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const [question, setQuestion] = useState<Question | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchingQuestion, setFetchingQuestion] = useState<boolean>(true);
  const [initialCode, setInitialCode] = useState<string>("");
  const [emotionData, setEmotionData] = useState<any>(null);
  const [currentCode, setCurrentCode] = useState<string>("");
  const [currentLanguage, setCurrentLanguage] = useState<string>("javascript");
  
  // Session tracking
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionQuestionId, setSessionQuestionId] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [showNextButton, setShowNextButton] = useState<boolean>(false);
  const [completedQuestions, setCompletedQuestions] = useState<Array<{
    question: any,
    code: string,
    language: string,
    testResults: any,
    submissionTime: string
  }>>([]);
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [isNewInterviewStarted, setIsNewInterviewStarted] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Create a new session when component mounts
  useEffect(() => {
    const createNewSession = async () => {
      try {
        const session = await sessionApi.createSession(
          undefined, // No user ID for now
          `Interview Session - ${new Date().toLocaleString()}`
        );
        setSessionId(session.id);
        console.log('Created new interview session:', session.id);
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };
    
    createNewSession();
  }, []);

  // Fetch question from backend based on questionId if available
  useEffect(() => {
    console.log('InterviewSession mounted, questionId:', questionId);
    
    const loadQuestion = async () => {
      if (questionId) {
        console.log('Fetching question by ID:', questionId);
        await fetchQuestionById(parseInt(questionId));
      } else {
        console.log('Generating new question');
        await fetchNewQuestion();
      }
    };
    
    loadQuestion().catch(err => {
      console.error('Error in loadQuestion:', err);
      setFetchError('Error loading question: ' + (err.message || 'Unknown error'));
      setQuestion(mockQuestion);
      setFetchingQuestion(false);
    });
  }, [questionId]);
  
  // Track emotion data
  useEffect(() => {
    if (sessionId && emotionData) {
      const trackEmotionData = async () => {
        try {
          await sessionApi.addEmotionSnapshot(sessionId, {
            attention_level: emotionData.attention_level,
            positivity_level: emotionData.positivity_level,
            arousal_level: emotionData.arousal_level,
            dominant_emotion: emotionData.dominant_emotion,
            face_detected: true,
            question_id: question?.id
          });
          console.log('Emotion data tracked in session');
        } catch (error) {
          console.error('Failed to track emotion data:', error);
        }
      };
      
      trackEmotionData();
    }
  }, [emotionData, sessionId, question?.id]);
  
  // When a question is loaded, add it to the session
  useEffect(() => {
    if (sessionId && question) {
      const addQuestionToSession = async () => {
        try {
          const sessionQuestion = await sessionApi.addQuestionToSession(
            sessionId,
            question.id
          );
          setSessionQuestionId(sessionQuestion.id);
          console.log('Added question to session:', sessionQuestion);
        } catch (error) {
          console.error('Failed to add question to session:', error);
        }
      };
      
      addQuestionToSession();
    }
  }, [sessionId, question]);

  // Handle timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to run tests
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        console.log("Keyboard shortcut detected: Run Tests (Ctrl+Enter)");
        handleRunTest();
      }
      // Ctrl+Shift+Enter or Cmd+Shift+Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        console.log("Keyboard shortcut detected: Submit (Ctrl+Shift+Enter)");
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentCode, question]);

  // Create template code based on the question title
  useEffect(() => {
    if (question) {
      // Generate a code template based on question
      const title = question.title.toLowerCase();
      if (title.includes('two sum')) {
        setInitialCode(`// Two Sum solution
function twoSum(nums, target) {
  // Your implementation here
  
  // Example test:
  // Input: nums = [2,7,11,15], target = 9
  // Output: [0,1]
  
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
`);
      } else if (title.includes('palindrome')) {
        setInitialCode(`// Palindrome solution
function isPalindrome(s) {
  // Your implementation here
  
  // Example:
  // Input: s = "A man, a plan, a canal: Panama"
  // Output: true
  
  // Clean string - remove non-alphanumeric and convert to lowercase
  const cleanStr = s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  // Check if the string reads the same forward and backward
  return cleanStr === cleanStr.split('').reverse().join('');
}
`);
      } else {
        // Default template
        setInitialCode(`// ${question.title} solution
function solution(input) {
  // Your implementation here
  
  // Read the problem statement carefully
  // Consider edge cases
  // Test your solution with different inputs
  
  // Code here
  
  return result;
}
`);
      }
    }
  }, [question]);

  const fetchQuestionById = async (id: number) => {
    setFetchingQuestion(true);
    try {
      // First check if the backend is available
      console.log('Checking backend health...');
      await questionApi.healthCheck();
      console.log('Backend is healthy, fetching question...');
      
      // Get the specific question by ID
      const data = await questionApi.getQuestion(id);
      console.log('Fetched question by ID:', data);
      setQuestion(data);
      setFetchError(null);
    } catch (error) {
      console.error(`Error fetching question with ID ${id}:`, error);
      setFetchError(`Failed to fetch question with ID ${id}. Using a sample question instead.`);
      // Use mock question as fallback
      setQuestion(mockQuestion);
    } finally {
      setFetchingQuestion(false);
    }
  };

  const fetchNewQuestion = async () => {
    setFetchingQuestion(true);
    try {
      // First check if the backend is available
      console.log('Checking backend health...');
      await questionApi.healthCheck();
      console.log('Backend is healthy, generating new question...');
      
      // Generate a new question using our API service
      const data = await questionApi.generateQuestion('medium');
      console.log('Generated new question:', data);
      setQuestion(data);
      setFetchError(null);
    } catch (error) {
      console.error('Error generating question:', error);
      setFetchError('Failed to generate a question. Using a sample question instead.');
      // Use mock question as fallback
      setQuestion(mockQuestion);
    } finally {
      setFetchingQuestion(false);
    }
  };

  const handleRunTest = async (code?: string) => {
    const codeToRun = code || currentCode;
    
    if (!question || !codeToRun) {
      console.error("Cannot run test: missing question or code");
      return;
    }
    
    console.log(`Running test for question ID ${question.id} with language ${currentLanguage}`);
    setIsLoading(true);
    setShowResult(false);
    
    try {
      // Submit code for testing but don't record it as a final submission
      const testResult = await questionApi.testCode(question.id, codeToRun, currentLanguage);
      console.log("Received test results:", testResult);
      
      // Format results for display
      const passedCount = testResult.passed_test_cases;
      const totalCount = testResult.total_test_cases;
      const passRate = (passedCount / totalCount) * 100;
      
      let resultText = `Test Results: ${passedCount}/${totalCount} tests passed (${passRate.toFixed(1)}%)\n\n`;
      resultText += `Feedback: ${testResult.feedback}\n`;
      resultText += `Time Complexity: ${testResult.time_complexity}\n`;
      resultText += `Space Complexity: ${testResult.space_complexity}\n\n`;
      
      // Add details for each test case
      testResult.results.forEach((result, index) => {
        resultText += `Test Case ${index + 1}: ${result.passed ? 'PASSED' : 'FAILED'}\n`;
        resultText += `Input: ${result.test_case.input}\n`;
        resultText += `Expected Output: ${result.test_case.output}\n`;
        resultText += `Actual Output: ${result.actual_output}\n`;
        if (result.error_message) {
          resultText += `Error: ${result.error_message}\n`;
        }
        resultText += `Time: ${result.execution_time.toFixed(2)}ms\n\n`;
      });
      
      setResult(resultText);
      setShowResult(true);
    } catch (error) {
      console.error('Error testing code:', error);
      setResult(`Error testing code: ${error}`);
      setShowResult(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (code?: string) => {
    const codeToSubmit = code || currentCode;
    
    if (!question || !codeToSubmit) {
      console.error("Cannot submit: missing question or code");
      return;
    }
    
    console.log(`Submitting solution for question ID ${question.id} with language ${currentLanguage}`);
    setIsLoading(true);
    setShowResult(false);
    
    try {
      // Submit code for testing
      const testResult = await questionApi.testCode(question.id, codeToSubmit, currentLanguage);
      console.log("Received submission results:", testResult);
      setTestResults(testResult);
      
      // Format results for display
      const passedCount = testResult.passed_test_cases;
      const totalCount = testResult.total_test_cases;
      const passRate = (passedCount / totalCount) * 100;
      
      let resultText = `Test Results: ${passedCount}/${totalCount} tests passed (${passRate.toFixed(1)}%)\n\n`;
      resultText += `Feedback: ${testResult.feedback}\n`;
      resultText += `Time Complexity: ${testResult.time_complexity}\n`;
      resultText += `Space Complexity: ${testResult.space_complexity}\n\n`;
      
      // Add details for each test case
      testResult.results.forEach((result, index) => {
        resultText += `Test Case ${index + 1}: ${result.passed ? 'PASSED' : 'FAILED'}\n`;
        resultText += `Input: ${result.test_case.input}\n`;
        resultText += `Expected Output: ${result.test_case.output}\n`;
        resultText += `Actual Output: ${result.actual_output}\n`;
        if (result.error_message) {
          resultText += `Error: ${result.error_message}\n`;
        }
        resultText += `Time: ${result.execution_time.toFixed(2)}ms\n\n`;
      });
      
      setResult(resultText);
      setShowResult(true);
      setShowNextButton(true);
      
      // Store test results in session if available
      if (sessionId && sessionQuestionId && question) {
        try {
          await sessionApi.updateSessionQuestion(sessionId, question.id, {
            code_submitted: codeToSubmit,
            language: currentLanguage,
            passed_tests: testResult.passed_test_cases,
            total_tests: testResult.total_test_cases,
            test_results: testResult,
            end_time: new Date().toISOString(),
            duration: 45 * 60 - timeLeft // Calculate time spent
          });
          console.log('Updated session with code submission results');
          
          // Don't automatically complete the session or redirect
          // Let the user choose to go to the next question or end the interview
        } catch (error) {
          console.error('Failed to update session with code results:', error);
        }
      }
      
    } catch (error) {
      console.error('Error testing code:', error);
      setResult(`Error testing code: ${error}`);
      setShowResult(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    // Reset states
    setCurrentCode('');
    setShowResult(false);
    setIsLoading(true);
    setShowNextButton(false);
    setTestResults(null);
    setFetchingQuestion(true);
    
    // Generate a new question
    try {
      await fetchNewQuestion();
      
      // Create a new session question if we have a session
      if (sessionId && question) {
        try {
          const response = await sessionApi.addQuestionToSession(sessionId, question.id);
          setSessionQuestionId(response.id);
          console.log('Added new question to session:', response);
        } catch (error) {
          console.error('Failed to add question to session:', error);
        }
      }
    } catch (error) {
      console.error('Error getting next question:', error);
    } finally {
      setIsLoading(false);
      setFetchingQuestion(false);
    }
  };

  const handleEndInterview = () => {
    if (sessionId) {
      // Complete the session when user ends the interview
      const completeSession = async () => {
        try {
          setIsLoading(true);
          
          await sessionApi.updateSession(sessionId, {
            end_time: new Date().toISOString(),
            duration: 45 * 60 - timeLeft,
            completed: true
          });
          console.log('Session completed');
          
          // Show redirect notification
          setIsRedirecting(true);
          setTimeout(() => {
            // Redirect to the report page
            navigate(`/report/${sessionId}`);
          }, 2000);
        } catch (error) {
          console.error('Failed to complete session:', error);
          setIsLoading(false);
        }
      };
      
      completeSession();
    } else {
      navigate('/');
    }
  };

  const handleEmotionUpdate = (data: any) => {
    setEmotionData(data);
  };

  const handleRunButton = () => {
    // Get the latest code directly from the textarea ref
    if (textareaRef.current) {
      const latestCode = textareaRef.current.value;
      setCurrentCode(latestCode);
      handleRunTest(latestCode);
    } else {
      // Fallback to the currentCode state if ref isn't available
      handleRunTest(currentCode);
    }
  };

  const handleSubmitButton = () => {
    // Get the latest code directly from the textarea ref
    if (textareaRef.current) {
      const latestCode = textareaRef.current.value;
      setCurrentCode(latestCode);
      handleSubmit(latestCode);
    } else {
      // Fallback to the currentCode state if ref isn't available
      handleSubmit(currentCode);
    }
  };

  const handleStartNewInterview = async () => {
    if (question && currentCode) {
      // Save current question to completed questions
      setCompletedQuestions(prev => [...prev, {
        question: question,
        code: currentCode,
        language: currentLanguage,
        testResults: testResults,
        submissionTime: new Date().toISOString()
      }]);
    }
    
    // Reset states for new question
    setCurrentCode('');
    setShowResult(false);
    setIsLoading(true);
    setShowNextButton(false);
    setTestResults(null);
    setFetchingQuestion(true);
    setActiveQuestion(completedQuestions.length + 1);
    setIsNewInterviewStarted(true);
    
    // Generate a new question
    try {
      await fetchNewQuestion();
      
      // Create a new session question if we have a session
      if (sessionId && question) {
        try {
          const response = await sessionApi.addQuestionToSession(sessionId, question.id);
          setSessionQuestionId(response.id);
          console.log('Added new question to session:', response);
        } catch (error) {
          console.error('Failed to add question to session:', error);
        }
      }
    } catch (error) {
      console.error('Error getting next question:', error);
    } finally {
      setIsLoading(false);
      setFetchingQuestion(false);
    }
  };

  // Render the completed questions panel if there are any completed questions
  const renderCompletedQuestions = () => {
    if (completedQuestions.length === 0) return null;
    
    return (
      <Box sx={{ 
        width: '300px', 
        borderLeft: '1px solid #e0e0e0',
        padding: 2,
        display: { xs: 'none', md: 'block' }, // Hide on small screens
        overflow: 'auto'
      }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Previous Questions
        </Typography>
        
        {completedQuestions.map((item, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {index + 1}. {item.question.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={item.question.difficulty?.toUpperCase()} 
                size="small"
                color={
                  item.question.difficulty === 'easy' ? 'success' : 
                  item.question.difficulty === 'medium' ? 'warning' : 'error'
                } 
              />
              {item.testResults && (
                <Chip 
                  label={`${item.testResults.passed_test_cases}/${item.testResults.total_test_cases} Tests`}
                  size="small"
                  color={item.testResults.passed ? 'success' : 'error'}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Submitted: {new Date(item.submissionTime).toLocaleTimeString()}
            </Typography>
          </Paper>
        ))}
      </Box>
    );
  };

  // Show loading spinner while fetching question
  if (fetchingQuestion) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Navbar onLogout={onLogout} />
        <CircularProgress size={60} sx={{ mb: 3, mt: 10 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>Loading interview question...</Typography>
        <Typography color="text.secondary">This may take a moment</Typography>
      </Box>
    );
  }

  // Fallback to mock question if no question available
  const currentQuestion = question || mockQuestion;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar onLogout={onLogout} />
      
      {/* Top bar with timer and end interview button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 2,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="error"
            startIcon={<ArrowBackIcon />} 
            onClick={handleEndInterview}
          >
            End Interview
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleStartNewInterview}
          >
            Start New Question
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {activeQuestion > 0 && (
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              Question {activeQuestion + 1}
            </Typography>
          )}
          <TimerIcon sx={{ mr: 1, color: timeLeft < 300 ? 'error.main' : 'inherit' }} />
          <Typography 
            variant="h6" 
            color={timeLeft < 300 ? 'error' : 'inherit'}
          >
            Time Remaining: {formatTime(timeLeft)}
          </Typography>
        </Box>
      </Box>
      
      {fetchingQuestion ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <CircularProgress />
        </Box>
      ) : fetchError ? (
        <Container sx={{ mt: 4 }}>
          <Alert severity="error">{fetchError}</Alert>
        </Container>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flex: 1, 
          gap: 2, 
          height: 'calc(100vh - 130px)', 
          overflow: 'hidden'
        }}>
          {/* Left column: Question details */}
          <Box sx={{ 
            width: { 
              xs: '100%', 
              md: isNewInterviewStarted ? '20%' : '30%' 
            },
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'auto',
            padding: 2
          }}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h5" gutterBottom>{question?.title}</Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={question?.difficulty?.toUpperCase()} 
                  color={
                    question?.difficulty === 'easy' ? 'success' : 
                    question?.difficulty === 'medium' ? 'warning' : 'error'
                  } 
                  size="small" 
                />
                {question?.topics?.map((topic, index) => (
                  <Chip key={index} label={topic} size="small" variant="outlined" />
                ))}
              </Box>
              
              <Typography variant="body1" paragraph>
                {question?.desc}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Example:
              </Typography>
              
              <Box sx={{ backgroundColor: '#f5f5f5', p: 1.5, borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  <b>Input:</b> {question?.example?.input}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  <b>Output:</b> {question?.example?.output}
                </Typography>
                {question?.example?.explanation && (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    <b>Explanation:</b> {question?.example?.explanation}
                  </Typography>
                )}
              </Box>
              
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Constraints:
              </Typography>
              
              <List dense sx={{ mb: 2 }}>
                {question?.constraints?.map((constraint, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: '30px' }}>
                      <CircleIcon sx={{ fontSize: 8 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={constraint} 
                      primaryTypographyProps={{ 
                        variant: 'body2', 
                        sx: { whiteSpace: 'pre-wrap' } 
                      }} 
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
          
          {/* Middle section: Code editor and test results */}
          <Box sx={{ 
            width: { 
              xs: '100%', 
              md: isNewInterviewStarted ? '45%' : '45%' 
            },
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'auto',
            padding: 2
          }}>
            <Paper sx={{ p: 2, mb: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Your Solution
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  flexWrap: 'wrap',
                  gap: 1,
                  mb: 2
                }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="outlined"
                      onClick={handleRunButton}
                      disabled={isLoading || !question}
                      startIcon={<PlayArrowIcon />}
                      sx={{ 
                        borderRadius: 2,
                        flexGrow: { xs: 1, sm: 0 }  
                      }}
                    >
                      Run Tests
                    </Button>
                    
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleSubmitButton}
                      disabled={isLoading || !question}
                      sx={{ 
                        borderRadius: 2,
                        flexGrow: { xs: 1, sm: 0 } 
                      }}
                    >
                      Submit Solution
                    </Button>
                  </Box>
                  
                  <Box sx={{ 
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    color: 'text.secondary',
                    fontSize: '0.875rem'
                  }}>
                    <Tooltip title="Run your code and see if it passes the test cases">
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <KeyboardIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        <span>Ctrl+Enter: Run Tests</span>
                      </Box>
                    </Tooltip>
                    
                    <Tooltip title="Submit your final solution">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <KeyboardIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        <span>Ctrl+Shift+Enter: Submit</span>
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ flex: 1, mb: 2 }}>
                <CodeEditor
                  initialCode={initialCode}
                  questionTitle={question?.title || "Coding Question"}
                  onRun={(code, language) => {
                    console.log("Running code with language:", language);
                    setCurrentLanguage(language);
                    handleRunTest(code);
                  }}
                  onSubmit={(code, language) => {
                    console.log("Submitting code with language:", language);
                    setCurrentLanguage(language);
                    handleSubmit(code);
                  }}
                  textareaRef={textareaRef}
                />
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">Test Results</Typography>
                    <Box>
                      {showNextButton && (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          onClick={handleNextQuestion}
                          sx={{ mr: 2 }}
                        >
                          Next Question
                        </Button>
                      )}
                      {sessionId && (
                        <Button 
                          variant="outlined" 
                          color="error" 
                          onClick={handleEndInterview}
                        >
                          End Interview
                        </Button>
                      )}
                    </Box>
                  </Box>
                  
                  {/* Redirecting alert */}
                  {isRedirecting && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Redirecting to interview report...
                    </Alert>
                  )}
                  
                  {/* Test Results Section */}
                  {showResult ? (
                    <Box>
                      <Typography 
                        variant="body1" 
                        component="pre" 
                        sx={{ 
                          whiteSpace: 'pre-wrap', 
                          backgroundColor: '#f5f5f5', 
                          p: 2, 
                          borderRadius: 1,
                          fontFamily: 'monospace'
                        }}
                      >
                        {result}
                      </Typography>
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
                        p: 3, 
                        textAlign: 'center', 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: 1 
                      }}
                    >
                      <Typography color="text.secondary">
                        Run your code to see test results
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>
            </Paper>
          </Box>
          
          {!isNewInterviewStarted ? (
            /* Right column: Emotion Analysis (shown only when no new interview is started) */
            <Box sx={{ 
              width: { xs: '100%', md: '25%' }, 
              height: '100%',
              padding: 2
            }}>
              <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Emotion Analysis</Typography>
                <Box sx={{ flex: 1 }}>
                  <EmotionAnalysis onEmotionUpdate={handleEmotionUpdate} />
                </Box>
              </Paper>
            </Box>
          ) : (
            /* Completed questions panel - only shown when new interview is started */
            renderCompletedQuestions()
          )}
        </Box>
      )}
    </Box>
  );
};

export default InterviewSession; 