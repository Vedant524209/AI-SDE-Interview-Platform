import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Select, MenuItem, FormControl, InputLabel, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface CodeEditorProps {
  initialCode?: string;
  questionTitle?: string;
  onRun?: (code: string) => void;
  onSubmit?: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = "// Write your code here\n\nfunction solution() {\n  // Your implementation\n  \n  return result;\n}\n",
  questionTitle = "Coding Question",
  onRun,
  onSubmit
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [language, setLanguage] = useState<string>('javascript');

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleLanguageChange = (e: any) => {
    setLanguage(e.target.value);
  };

  const handleRun = () => {
    if (onRun) {
      onRun(code);
    } else {
      console.log('Running code:', code);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(code);
    } else {
      console.log('Submitting code:', code);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Editor header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid #eaeaea',
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {questionTitle}
        </Typography>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="language-select-label">Language</InputLabel>
          <Select
            labelId="language-select-label"
            value={language}
            onChange={handleLanguageChange}
            label="Language"
          >
            <MenuItem value="javascript">JavaScript</MenuItem>
            <MenuItem value="python">Python</MenuItem>
            <MenuItem value="java">Java</MenuItem>
            <MenuItem value="cpp">C++</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Code editor area */}
      <Box sx={{ flexGrow: 1, p: 0, backgroundColor: '#f8f9fa' }}>
        <Box
          component="textarea"
          value={code}
          onChange={handleCodeChange}
          sx={{
            width: '100%',
            height: '100%',
            minHeight: '400px',
            p: 2,
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: 1.5,
            color: '#1a1a1a',
            backgroundColor: '#f8f9fa',
            border: 'none',
            resize: 'none',
            '&:focus': {
              outline: 'none',
            },
          }}
        />
      </Box>

      {/* Action buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 2,
          gap: 2,
          borderTop: '1px solid #eaeaea',
        }}
      >
        <Button
          variant="outlined"
          startIcon={<PlayArrowIcon />}
          onClick={handleRun}
        >
          Run
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default CodeEditor; 