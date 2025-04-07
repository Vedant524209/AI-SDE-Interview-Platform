import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, Paper, Divider, Chip, Stack, CircularProgress, List, ListItem, ListItemText, Card, CardContent, Alert, Grid } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import QuizIcon from '@mui/icons-material/Quiz';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import VideocamIcon from '@mui/icons-material/Videocam';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CodeIcon from '@mui/icons-material/Code';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { questionApi } from '../services/api';
import { Question } from '../types';

interface InterviewPageProps {
  onLogout: () => void;
}

const InterviewPage: React.FC<InterviewPageProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isStarted, setIsStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  // Fetch existing questions on component mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // First check backend health
      await questionApi.healthCheck().catch(() => {
        throw new Error("Backend server is not available");
      });
      
      // Fetch all questions
      const data = await questionApi.getAllQuestions();
      console.log("Fetched questions:", data);
      setQuestions(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load existing questions. You can still start a new interview.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    try {
      setLoading(true);
      
      // Generate a new question when starting a new interview
      console.log("Generating new question...");
      const newQuestion = await questionApi.generateQuestion('medium').catch((err) => {
        console.error("Error generating question:", err);
        return null;
      });
      
      setIsStarted(true);
      
      if (newQuestion && newQuestion.id) {
        console.log("Generated question:", newQuestion);
        setActiveQuestion(newQuestion);
        // If successfully generated a question, navigate to it
        navigate(`/interview-session?questionId=${newQuestion.id}`);
      } else {
        console.warn("Failed to generate question, using default navigation");
        // Otherwise just navigate to interview session
        navigate('/interview-session');
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      setError('Failed to start interview. Please try again.');
      // If there's an error, still navigate but without a question ID
      navigate('/interview-session');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueInterview = () => {
    if (activeQuestion && activeQuestion.id) {
      navigate(`/interview-session?questionId=${activeQuestion.id}`);
    } else {
      navigate('/interview-session');
    }
  };

  const handlePracticeQuestion = (questionId: number) => {
    navigate(`/interview-session?questionId=${questionId}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    return difficulty === 'easy' ? 'success' : 
           difficulty === 'medium' ? 'warning' : 'error';
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficulty === 'easy' ? 'Easy' : 
           difficulty === 'medium' ? 'Medium' : 'Hard';
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar onLogout={onLogout} />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#2a394f', mb: 1 }}>
            Coding Interview Preparation
          </Typography>
          <Typography variant="h6" component="h2" sx={{ color: '#637381', mb: 4 }}>
            Practice with AI-powered interviews and real-time feedback
          </Typography>
          
          {error && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
            <Box sx={{ flex: { md: 2 } }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  backgroundColor: '#1a2634', 
                  color: 'white',
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TipsAndUpdatesIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Interview Tips
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    • Explain your approach before you start coding
                  </Typography>
                  <Typography variant="body2">
                    • Think about edge cases in your solution
                  </Typography>
                  <Typography variant="body2">
                    • Consider time and space complexity
                  </Typography>
                  <Typography variant="body2">
                    • Test your solution with a few examples
                  </Typography>
                </Box>
              </Paper>
            </Box>
            <Box sx={{ flex: { md: 1 } }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  backgroundColor: '#0288d1', 
                  color: 'white',
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SentimentSatisfiedAltIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Emotion Analysis
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Your interview session now includes real-time emotion tracking to help improve your performance.
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <VideocamIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption">Camera access required</Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
          
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
            <Box sx={{ 
              p: 3, 
              display: 'flex', 
              alignItems: 'center',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <CodeIcon sx={{ color: '#637381', mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                45-Minute Coding Interview
              </Typography>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Solve algorithmic and data structure problems with real-time feedback and performance tracking.
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography>Preparing your interview...</Typography>
                </Box>
              ) : !isStarted ? (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={handleStartInterview}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600
                  }}
                >
                  Start New Interview
                </Button>
              ) : (
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ fontWeight: 600 }}
                    onClick={handleContinueInterview}
                  >
                    Continue Interview
                  </Button>
                  <Chip 
                    label="In Progress" 
                    color="warning" 
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              )}
            </Box>
          </Paper>
          
          {/* Available Questions Section */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 3, color: '#2a394f' }}>
              Available Questions
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : questions.length === 0 ? (
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography>No questions available. Start a new interview to generate one!</Typography>
              </Paper>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                {questions.map((q: Question) => (
                  <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }} key={q.id}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3,
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => handlePracticeQuestion(q.id)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: '#2a394f' }}>
                          {q.title}
                        </Typography>
                        <Chip 
                          label={getDifficultyLabel(q.difficulty)}
                          size="small"
                          color={getDifficultyColor(q.difficulty)} 
                        />
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 2, 
                          color: '#637381',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          height: '40px' 
                        }}
                      >
                        {q.desc}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {q.topics.map((topic: string, idx: number) => (
                          <Chip
                            key={idx}
                            label={topic}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                      
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'flex-end', 
                          mt: 2 
                        }}
                      >
                        <Button 
                          size="small" 
                          variant="outlined"
                          sx={{ borderRadius: 4 }}
                        >
                          Practice Now
                        </Button>
                      </Box>
                    </Paper>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default InterviewPage; 