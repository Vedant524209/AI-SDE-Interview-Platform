import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, Paper, Divider, Chip, Stack, CircularProgress, List, ListItem, ListItemText, Card, CardContent, Alert } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import QuizIcon from '@mui/icons-material/Quiz';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { questionApi, Question } from '../services/api';

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

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar onLogout={onLogout} />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#2a394f', mb: 1 }}>
            Software Engineer
          </Typography>
          <Typography variant="h6" component="h2" sx={{ color: '#637381', mb: 4 }}>
            Practice with AI-powered interviews
          </Typography>
          
          {error && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {!isStarted && (
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
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box component="span" sx={{ mr: 1, fontSize: '1.5rem' }}>👋</Box>
                    <Typography variant="h6">
                      You have 1 mock interview available
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
                        NEW: Emotion Analysis
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Your interview session now includes real-time emotion tracking to help improve your interview performance.
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <VideocamIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="caption">Camera access required</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}
          
          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
            <Box sx={{ 
              p: 3, 
              display: 'flex', 
              alignItems: 'center',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <AccessTimeIcon sx={{ color: '#637381', mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                45 minutes coding interview
              </Typography>
            </Box>
            
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Solve algorithmic and data structure problems designed to test your problem-solving skills
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
                  Start Interview
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
          
          {/* Previous Questions Section */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 3, color: '#2a394f' }}>
              Available Questions
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : error && questions.length === 0 ? (
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: '#fff4e5', color: '#7A4F01' }}>
                <Typography>{error}</Typography>
              </Paper>
            ) : questions.length === 0 ? (
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography>No questions available. Start a new interview to generate one!</Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {questions.map((question) => (
                  <Card key={question.id} elevation={1}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {question.title}
                        </Typography>
                        <Chip 
                          label={question.difficulty.toUpperCase()}
                          color={getDifficultyColor(question.difficulty)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {question.desc.length > 150 ? question.desc.substring(0, 150) + '...' : question.desc}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {question.topics.map((topic, index) => (
                          <Chip key={index} label={topic} size="small" variant="outlined" />
                        ))}
                      </Box>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        sx={{ mt: 2 }}
                        onClick={() => handlePracticeQuestion(question.id)}
                      >
                        Practice This Question
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
          
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 3, color: '#2a394f' }}>
              What to expect
            </Typography>
            
            <Stack spacing={3}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <PersonIcon sx={{ color: '#1976d2', mr: 2, mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      AI-Interviewer
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      The AI-powered bot will pose challenging and dynamic questions to you, just like in a real interview
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <QuizIcon sx={{ color: '#1976d2', mr: 2, mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Real interview questions
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Get questions on real world topics like arrays, strings, linked lists, trees and graphs
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <FeedbackIcon sx={{ color: '#1976d2', mr: 2, mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Personalized feedback
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Get detailed feedback on your performance so you can ace your next job interview
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default InterviewPage; 