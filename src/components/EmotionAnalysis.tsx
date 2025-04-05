import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, LinearProgress, Paper, Button, IconButton, Tooltip } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

interface EmotionData {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  surprised: number;
  engagement: number;
}

interface EmotionAnalysisProps {
  onEmotionUpdate?: (emotionData: EmotionData) => void;
}

const EmotionAnalysis: React.FC<EmotionAnalysisProps> = ({ onEmotionUpdate }) => {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [emotionData, setEmotionData] = useState<EmotionData>({
    neutral: 70,
    happy: 20,
    sad: 5,
    angry: 3,
    surprised: 2,
    engagement: 85
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Function to toggle camera
  const toggleCamera = async () => {
    if (cameraEnabled) {
      // Turn off camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setCameraEnabled(false);
    } else {
      try {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: micEnabled
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
        setCameraEnabled(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Failed to access camera. Please check your permissions.");
      }
    }
  };

  // Function to toggle microphone
  const toggleMic = async () => {
    setMicEnabled(!micEnabled);
    
    // If camera is already on, update the stream to include/exclude audio
    if (cameraEnabled) {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: !micEnabled 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
      } catch (err) {
        console.error("Error toggling microphone:", err);
      }
    }
  };

  // Simulate emotion analysis (would be replaced with actual ML-based analysis)
  useEffect(() => {
    if (!cameraEnabled) return;
    
    // This interval simulates real emotion analysis
    // In a real application, this would analyze video frames
    const interval = setInterval(() => {
      // Generate random fluctuations in emotion values
      const neutral = Math.min(100, Math.max(0, emotionData.neutral + (Math.random() * 10 - 5)));
      const happy = Math.min(100, Math.max(0, emotionData.happy + (Math.random() * 10 - 5)));
      const sad = Math.min(100, Math.max(0, emotionData.sad + (Math.random() * 6 - 3)));
      const angry = Math.min(100, Math.max(0, emotionData.angry + (Math.random() * 6 - 3)));
      const surprised = Math.min(100, Math.max(0, emotionData.surprised + (Math.random() * 6 - 3)));
      
      // Calculate total and normalize
      const total = neutral + happy + sad + angry + surprised;
      const normalized = {
        neutral: Math.round((neutral / total) * 100),
        happy: Math.round((happy / total) * 100),
        sad: Math.round((sad / total) * 100),
        angry: Math.round((angry / total) * 100),
        surprised: Math.round((surprised / total) * 100),
        engagement: Math.round(Math.min(100, Math.max(0, emotionData.engagement + (Math.random() * 10 - 4))))
      };
      
      setEmotionData(normalized);
      
      // Call the callback if provided
      if (onEmotionUpdate) {
        onEmotionUpdate(normalized);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [cameraEnabled, emotionData, onEmotionUpdate]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Get emotion icon based on dominant emotion
  const getEmotionIcon = () => {
    const emotions = [
      { name: 'happy', value: emotionData.happy, icon: <SentimentSatisfiedAltIcon color="success" /> },
      { name: 'sad', value: emotionData.sad, icon: <SentimentDissatisfiedIcon color="info" /> },
      { name: 'angry', value: emotionData.angry, icon: <SentimentVeryDissatisfiedIcon color="error" /> },
    ];
    
    // Find emotion with highest value
    const dominantEmotion = emotions.reduce((prev, current) => 
      (prev.value > current.value) ? prev : current
    );
    
    // If neutral is higher than the dominant emotion, show neutral
    if (emotionData.neutral > dominantEmotion.value) {
      return <SentimentSatisfiedAltIcon />;
    }
    
    return dominantEmotion.icon;
  };

  // Get color for progress bar based on value
  const getColorForValue = (value: number) => {
    if (value < 30) return 'error';
    if (value < 70) return 'warning';
    return 'success';
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Interview Emotion Analysis {getEmotionIcon()}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={cameraEnabled ? "Turn camera off" : "Turn camera on"}>
            <IconButton 
              onClick={toggleCamera} 
              color={cameraEnabled ? "primary" : "default"}
            >
              {cameraEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={micEnabled ? "Turn microphone off" : "Turn microphone on"}>
            <IconButton 
              onClick={toggleMic} 
              color={micEnabled ? "primary" : "default"}
            >
              {micEnabled ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Box sx={{ 
          width: { xs: '100%', md: '200px' }, 
          height: '150px', 
          bgcolor: 'black', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderRadius: 1
        }}>
          {!cameraEnabled ? (
            <Typography color="white">Camera off</Typography>
          ) : null}
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            style={{ 
              display: cameraEnabled ? 'block' : 'none',
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              borderRadius: '4px'
            }}
          />
        </Box>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" gutterBottom>Emotion Analysis</Typography>
          
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Neutral</Typography>
              <Typography variant="body2">{emotionData.neutral}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={emotionData.neutral} 
              sx={{ height: 8, borderRadius: 2 }}
            />
          </Box>
          
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Happy</Typography>
              <Typography variant="body2">{emotionData.happy}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={emotionData.happy} 
              color="success"
              sx={{ height: 8, borderRadius: 2 }}
            />
          </Box>
          
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Sad</Typography>
              <Typography variant="body2">{emotionData.sad}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={emotionData.sad} 
              color="info"
              sx={{ height: 8, borderRadius: 2 }}
            />
          </Box>
          
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Angry</Typography>
              <Typography variant="body2">{emotionData.angry}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={emotionData.angry} 
              color="error"
              sx={{ height: 8, borderRadius: 2 }}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Surprised</Typography>
              <Typography variant="body2">{emotionData.surprised}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={emotionData.surprised} 
              color="warning"
              sx={{ height: 8, borderRadius: 2 }}
            />
          </Box>
          
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" fontWeight="bold">Engagement Level</Typography>
              <Typography variant="body2" fontWeight="bold">{emotionData.engagement}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={emotionData.engagement} 
              color={getColorForValue(emotionData.engagement) as "success" | "warning" | "error"}
              sx={{ height: 10, borderRadius: 2 }}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default EmotionAnalysis; 