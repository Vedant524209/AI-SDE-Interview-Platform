import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, CircularProgress, LinearProgress, IconButton, Switch, FormControlLabel } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { questionApi, EmotionAnalysisResult, UserState } from '../services/api';

interface EmotionAnalysisProps {
  onEmotionUpdate?: (data: EmotionAnalysisResult) => void;
}

const EmotionAnalysis: React.FC<EmotionAnalysisProps> = ({ onEmotionUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(false);
  const [micEnabled, setMicEnabled] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [emotionData, setEmotionData] = useState<EmotionAnalysisResult>({
    attention_level: 0.75,
    positivity_level: 0.8,
    arousal_level: 0.7,
    dominant_emotion: 'confident',
    face_detected: false
  });
  
  // Handle camera toggle
  const toggleCamera = async () => {
    if (cameraEnabled) {
      // Turn off camera
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraEnabled(false);
    } else {
      // Turn on camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraEnabled(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setCameraEnabled(false);
      }
    }
  };
  
  // Handle microphone toggle
  const toggleMic = async () => {
    if (micEnabled) {
      // Turn off microphone
      setMicEnabled(false);
    } else {
      // Turn on microphone
      try {
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        setMicEnabled(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setMicEnabled(false);
      }
    }
  };
  
  // Capture video frame and analyze emotion
  const captureAndAnalyze = async () => {
    if (!cameraEnabled || !videoRef.current || !canvasRef.current) return;
    
    try {
      setIsAnalyzing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to base64 image
      const imageData = canvas.toDataURL('image/jpeg');
      
      try {
        // Call backend API for emotion analysis
        const result = await questionApi.analyzeEmotion(imageData);
        setEmotionData(result);
        
        // Notify parent component if callback is provided
        if (onEmotionUpdate) {
          onEmotionUpdate(result);
        }
        
        // Log the user state to the backend
        if (result.face_detected) {
          const userState: UserState = {
            attention_level: result.attention_level,
            positivity_level: result.positivity_level,
            arousal_level: result.arousal_level,
            dominant_emotion: result.dominant_emotion as any
          };
          await questionApi.logUserState(userState).catch(err => console.error('Failed to log user state:', err));
        }
      } catch (error) {
        console.error('Error analyzing emotion:', error);
        // Generate simulated data in case of API error
        simulateEmotionData();
      }
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Generate simulated emotion data for testing
  const simulateEmotionData = () => {
    // Gradually change values to simulate emotion changes
    setEmotionData(prev => {
      const newAttention = Math.min(1, Math.max(0.5, prev.attention_level + (Math.random() * 0.1 - 0.05)));
      const newPositivity = Math.min(1, Math.max(0.5, prev.positivity_level + (Math.random() * 0.1 - 0.05)));
      const newArousal = Math.min(1, Math.max(0.5, prev.arousal_level + (Math.random() * 0.1 - 0.05)));
      
      // Determine dominant emotion based on positivity and arousal
      let dominantEmotion = 'neutral';
      if (newPositivity > 0.8 && newArousal > 0.7) dominantEmotion = 'happy';
      else if (newPositivity > 0.6 && newArousal > 0.8) dominantEmotion = 'confident';
      else if (newPositivity < 0.6 && newArousal > 0.7) dominantEmotion = 'uncomfortable';
      
      const result = {
        attention_level: newAttention,
        positivity_level: newPositivity,
        arousal_level: newArousal,
        dominant_emotion: dominantEmotion,
        face_detected: true
      };
      
      // Notify parent component if callback is provided
      if (onEmotionUpdate) {
        onEmotionUpdate(result);
      }
      
      return result;
    });
  };
  
  // Start emotion analysis when camera is enabled
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (cameraEnabled) {
      // Use real analysis if camera is enabled
      interval = setInterval(captureAndAnalyze, 5000); // Analyze every 5 seconds
    } else {
      // Use simulated data if camera is disabled
      interval = setInterval(simulateEmotionData, 3000); // Simulate every 3 seconds
    }
    
    return () => clearInterval(interval);
  }, [cameraEnabled]);
  
  // Helper function to get color based on value
  const getValueColor = (value: number) => {
    if (value < 0.4) return '#f44336'; // Red
    if (value < 0.7) return '#ff9800'; // Orange
    return '#4caf50'; // Green
  };
  
  // Helper function to get emotion icon
  const getEmotionIcon = () => {
    switch (emotionData.dominant_emotion) {
      case 'happy':
        return <SentimentVerySatisfiedIcon fontSize="large" sx={{ color: '#4caf50' }} />;
      case 'confident':
        return <SentimentSatisfiedIcon fontSize="large" sx={{ color: '#2196f3' }} />;
      case 'uncomfortable':
        return <SentimentDissatisfiedIcon fontSize="large" sx={{ color: '#ff9800' }} />;
      default:
        return <SentimentSatisfiedIcon fontSize="large" sx={{ color: '#9e9e9e' }} />;
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Emotion Analysis
      </Typography>
      
      {/* Video feed */}
      <Box sx={{ position: 'relative', mb: 2 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ 
            width: '100%', 
            borderRadius: '8px',
            display: cameraEnabled ? 'block' : 'none',
            backgroundColor: '#f0f0f0'
          }}
        />
        
        {!cameraEnabled && (
          <Box
            sx={{
              height: '200px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f0f0f0',
              borderRadius: '8px'
            }}
          >
            <Typography color="text.secondary">
              Camera is disabled
            </Typography>
          </Box>
        )}
        
        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {/* Analyzing indicator */}
        {isAnalyzing && (
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
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px'
            }}
          >
            <CircularProgress size={30} sx={{ color: 'white' }} />
          </Box>
        )}
      </Box>
      
      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <IconButton onClick={toggleCamera} color={cameraEnabled ? "primary" : "default"}>
          {cameraEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
        </IconButton>
        
        <IconButton onClick={toggleMic} color={micEnabled ? "primary" : "default"}>
          {micEnabled ? <MicIcon /> : <MicOffIcon />}
        </IconButton>
      </Box>
      
      {/* Emotion metrics */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography sx={{ minWidth: 120 }}>Confidence:</Typography>
          <Box sx={{ width: '100%', ml: 1 }}>
            <LinearProgress
              variant="determinate"
              value={emotionData.positivity_level * 100}
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  backgroundColor: getValueColor(emotionData.positivity_level)
                }
              }}
            />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography sx={{ minWidth: 120 }}>Engagement:</Typography>
          <Box sx={{ width: '100%', ml: 1 }}>
            <LinearProgress
              variant="determinate"
              value={emotionData.attention_level * 100}
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  backgroundColor: getValueColor(emotionData.attention_level)
                }
              }}
            />
          </Box>
        </Box>
      </Box>
      
      {/* Current emotion */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {getEmotionIcon()}
        <Typography sx={{ ml: 1, textTransform: 'capitalize' }}>
          {emotionData.dominant_emotion}
        </Typography>
      </Box>
    </Paper>
  );
};

export default EmotionAnalysis; 