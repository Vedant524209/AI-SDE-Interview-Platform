import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Select, MenuItem, FormControl, InputLabel, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SendIcon from '@mui/icons-material/Send';

const languageTemplates = {
  javascript: `// Write your JavaScript solution here

function solution(nums, target) {
  // Your implementation
  
  return result;
}

// Example usage:
// solution([2,7,11,15], 9);
`,
  python: `# Write your Python solution here

def solution(nums, target):
    # Your implementation
    
    return result

# Example usage:
# solution([2,7,11,15], 9)
`,
  java: `// Write your Java solution here

class Solution {
    public int[] solution(int[] nums, int target) {
        // Your implementation
        
        return result;
    }
}

// Example usage:
// new Solution().solution(new int[]{2,7,11,15}, 9);
`,
  cpp: `// Write your C++ solution here

#include <vector>
using namespace std;

vector<int> solution(vector<int>& nums, int target) {
    // Your implementation
    
    return result;
}

// Example usage:
// vector<int> nums = {2,7,11,15};
// solution(nums, 9);
`
};

interface CodeEditorProps {
  initialCode?: string;
  questionTitle?: string;
  onRun?: (code: string, language: string) => void;
  onSubmit?: (code: string, language: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode,
  questionTitle = "Coding Question",
  onRun,
  onSubmit
}) => {
  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>(initialCode || languageTemplates.javascript);

  // Update code when language changes
  useEffect(() => {
    if (!initialCode) {
      setCode(languageTemplates[language as keyof typeof languageTemplates]);
    }
  }, [language, initialCode]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleLanguageChange = (e: any) => {
    setLanguage(e.target.value);
  };

  const handleRun = () => {
    if (onRun) {
      onRun(code, language);
    } else {
      console.log('Running code:', code, 'Language:', language);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(code, language);
    } else {
      console.log('Submitting code:', code, 'Language:', language);
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
          endIcon={<SendIcon />}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default CodeEditor; 