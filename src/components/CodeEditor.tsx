import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Button, Select, MenuItem, FormControl, InputLabel, Stack, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

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
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode,
  questionTitle = "Coding Question",
  onRun,
  onSubmit,
  textareaRef
}) => {
  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>(initialCode || languageTemplates.javascript);
  const [lineCount, setLineCount] = useState<number>(1);
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Use the provided ref or fall back to internal ref
  const finalTextareaRef = textareaRef || internalTextareaRef;

  // Update code when language changes or initial code changes
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      updateLineCount(initialCode);
    } else {
      setCode(languageTemplates[language as keyof typeof languageTemplates]);
      updateLineCount(languageTemplates[language as keyof typeof languageTemplates]);
    }
  }, [language, initialCode]);

  // Update line count when code changes
  const updateLineCount = (text: string) => {
    const lines = text.split('\n').length;
    setLineCount(lines);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    updateLineCount(newCode);
  };

  const handleLanguageChange = (e: any) => {
    setLanguage(e.target.value);
  };

  const handleRun = () => {
    if (onRun) {
      // Make sure we're using the latest code from the textarea
      let updatedCode = code;
      if (finalTextareaRef && finalTextareaRef.current) {
        updatedCode = finalTextareaRef.current.value || code;
        setCode(updatedCode);
      }
      console.log('Running code with language:', language);
      onRun(updatedCode, language);
    } else {
      console.log('Running code:', code, 'Language:', language);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      // Make sure we're using the latest code from the textarea
      let updatedCode = code;
      if (finalTextareaRef && finalTextareaRef.current) {
        updatedCode = finalTextareaRef.current.value || code;
        setCode(updatedCode);
      }
      console.log('Submitting code with language:', language);
      onSubmit(updatedCode, language);
    } else {
      console.log('Submitting code:', code, 'Language:', language);
    }
  };

  const handleReset = () => {
    const template = languageTemplates[language as keyof typeof languageTemplates];
    setCode(template);
    updateLineCount(template);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  // Handle tab key in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If tab is pressed, insert a tab character instead of changing focus
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.currentTarget;
      const newValue = code.substring(0, selectionStart) + '  ' + code.substring(selectionEnd);
      setCode(newValue);
      
      // Set the cursor position after the inserted tab
      setTimeout(() => {
        if (finalTextareaRef && finalTextareaRef.current) {
          finalTextareaRef.current.selectionStart = selectionStart + 2;
          finalTextareaRef.current.selectionEnd = selectionStart + 2;
        }
      }, 0);
    }
    
    // Handle Ctrl+Enter to run tests
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log("CodeEditor: Detected Ctrl+Enter, running code");
      handleRun();
    }
    
    // Handle Ctrl+Shift+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      console.log("CodeEditor: Detected Ctrl+Shift+Enter, submitting code");
      handleSubmit();
    }
  };

  // Generate line numbers
  const renderLineNumbers = () => {
    const numbers = [];
    for (let i = 1; i <= lineCount; i++) {
      numbers.push(
        <div 
          key={i} 
          style={{ 
            lineHeight: '1.5',
            color: '#888',
            userSelect: 'none',
            textAlign: 'right',
            paddingRight: '8px'
          }}
        >
          {i}
        </div>
      );
    }
    return numbers;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #e0e0e0', borderRadius: 1 }}>
      {/* Editor header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid #eaeaea',
          backgroundColor: '#fafafa'
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {questionTitle}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tooltip title="Copy code">
            <Button 
              size="small" 
              variant="outlined" 
              onClick={handleCopy}
              sx={{ minWidth: '36px', width: '36px', height: '36px', p: 0, borderRadius: '8px' }}
            >
              <ContentCopyIcon fontSize="small" />
            </Button>
          </Tooltip>
          
          <Tooltip title="Reset to template">
            <Button 
              size="small" 
              variant="outlined" 
              onClick={handleReset}
              sx={{ minWidth: '36px', width: '36px', height: '36px', p: 0, borderRadius: '8px' }}
            >
              <RestartAltIcon fontSize="small" />
            </Button>
          </Tooltip>
          
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
      </Box>

      {/* Code editor area */}
      <Box sx={{ 
        flexGrow: 1, 
        p: 0, 
        backgroundColor: '#f8f9fa',
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Line numbers */}
        <Box sx={{ 
          width: '40px', 
          backgroundColor: '#f0f0f0',
          pt: 2,
          pl: 1,
          pr: 0,
          overflowY: 'hidden'
        }}>
          {renderLineNumbers()}
        </Box>
        
        {/* Code textarea */}
        <Box
          component="textarea"
          ref={finalTextareaRef}
          value={code}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          sx={{
            width: 'calc(100% - 40px)',
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
    </Box>
  );
};

export default CodeEditor; 