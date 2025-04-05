import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Divider, Chip, Button, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TimerIcon from '@mui/icons-material/Timer';
import { useNavigate } from 'react-router-dom';
import CodeEditor from './CodeEditor';
import Navbar from './Navbar';

interface InterviewSessionProps {
  onLogout: () => void;
}

// Mock question data - in a real app, this would come from the backend
const mockQuestion = {
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
  topics: ["Array", "Hash Table"]
};

const InterviewSession: React.FC<InterviewSessionProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(45 * 60); // 45 minutes in seconds
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");

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

  const handleBack = () => {
    navigate('/interviews');
  };

  const handleRunCode = (code: string) => {
    setIsLoading(true);
    
    // Simulate code execution
    setTimeout(() => {
      setResult("Test cases passed: 2/3\n\nTest Case 1: ✅ Passed\nInput: nums = [2,7,11,15], target = 9\nExpected Output: [0,1]\nYour Output: [0,1]\n\nTest Case 2: ✅ Passed\nInput: nums = [3,2,4], target = 6\nExpected Output: [1,2]\nYour Output: [1,2]\n\nTest Case 3: ❌ Failed\nInput: nums = [3,3], target = 6\nExpected Output: [0,1]\nYour Output: null");
      setShowResult(true);
      setIsLoading(false);
    }, 1500);
  };

  const handleSubmitCode = (code: string) => {
    setIsLoading(true);
    
    // Simulate submission
    setTimeout(() => {
      setResult("Your solution has been submitted successfully!\n\nTest cases passed: 2/3\n\nOverall Score: 67%\n\nTime Complexity: O(n)\nSpace Complexity: O(n)\n\nFeedback: Your solution is correct for most cases but fails when there are duplicate elements in the array. Consider how to handle this edge case.");
      setShowResult(true);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar onLogout={onLogout} />
      
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ fontSize: '0.9rem' }}
          >
            Back to Interviews
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimerIcon color="error" />
            <Typography variant="h6" color="error">
              {formatTime(timeLeft)}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr', lg: '4fr 8fr' }, gap: 2 }}>
          {/* Question panel */}
          <Box>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight={600}>
                  {mockQuestion.title}
                </Typography>
                <Chip 
                  label={mockQuestion.difficulty.toUpperCase()} 
                  color={
                    mockQuestion.difficulty === 'easy' ? 'success' : 
                    mockQuestion.difficulty === 'medium' ? 'warning' : 'error'
                  }
                  size="small"
                />
              </Box>
              
              <Typography variant="body1" paragraph>
                {mockQuestion.desc}
              </Typography>
              
              <Typography variant="h6" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
                Example:
              </Typography>
              <Box sx={{ backgroundColor: '#f8f9fa', p: 2, borderRadius: 1, mb: 2, fontFamily: 'monospace' }}>
                <Typography variant="body2">
                  <strong>Input:</strong> {mockQuestion.example.input}
                </Typography>
                <Typography variant="body2">
                  <strong>Output:</strong> {mockQuestion.example.output}
                </Typography>
                <Typography variant="body2">
                  <strong>Explanation:</strong> {mockQuestion.example.explanation}
                </Typography>
              </Box>
              
              <Typography variant="h6" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
                Constraints:
              </Typography>
              <ul style={{ paddingLeft: '1.5rem', marginTop: 0 }}>
                {mockQuestion.constraints.map((constraint, index) => (
                  <li key={index}>
                    <Typography variant="body2">{constraint}</Typography>
                  </li>
                ))}
              </ul>
              
              <Typography variant="h6" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
                Topics:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {mockQuestion.topics.map((topic, index) => (
                  <Chip key={index} label={topic} size="small" />
                ))}
              </Box>
            </Paper>
          </Box>
          
          {/* Code editor panel */}
          <Box>
            <Paper sx={{ height: '100%', position: 'relative' }}>
              {!showResult ? (
                <CodeEditor 
                  questionTitle={mockQuestion.title}
                  onRun={handleRunCode}
                  onSubmit={handleSubmitCode}
                />
              ) : (
                <Box sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Results
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      backgroundColor: '#f8f9fa', 
                      p: 2, 
                      borderRadius: 1, 
                      minHeight: '400px',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      fontSize: '14px',
                      lineHeight: 1.5
                    }}
                  >
                    {result}
                  </Box>
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined" onClick={() => setShowResult(false)}>
                      Back to Code
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleBack}>
                      Finish Interview
                    </Button>
                  </Box>
                </Box>
              )}
              
              {isLoading && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 1000
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default InterviewSession; 