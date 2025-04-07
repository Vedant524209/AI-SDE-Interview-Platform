import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Button, Select, MenuItem, FormControl, InputLabel, Stack, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CodeIcon from '@mui/icons-material/Code';
import { judge0Service, JUDGE0_STATUS } from '../services/judge0Api';
import { SelectChangeEvent } from '@mui/material/Select';

export type SupportedLanguage = 'javascript' | 'python' | 'java' | 'cpp';

const languageTemplates: Record<SupportedLanguage, string> = {
  javascript: `// Write your solution function below
function solution(input) {
  // Your implementation here
  
  return result;
}

// Driver code - DO NOT MODIFY BELOW THIS LINE
// This code will automatically run your solution with test cases
function runTests() {
  const testCases = [
    // Test cases will be inserted here
  ];
  
  let passedCount = 0;
  let totalTime = 0;
  
  console.log("Running test cases...");
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(\`\\nTest Case \${i + 1}:\`);
    console.log(\`Input: \${testCase.input}\`);
    
    const startTime = performance.now();
    const result = solution(testCase.input);
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    totalTime += executionTime;
    
    console.log(\`Output: \${JSON.stringify(result)}\`);
    console.log(\`Expected: \${testCase.output}\`);
    
    const passed = JSON.stringify(result) === testCase.output;
    if (passed) {
      passedCount++;
      console.log("Status: PASSED");
    } else {
      console.log("Status: FAILED");
    }
    
    console.log(\`Execution Time: \${executionTime.toFixed(2)}ms\`);
  }
  
  console.log(\`\\nSummary: \${passedCount}/\${testCases.length} tests passed\`);
  console.log(\`Total Execution Time: \${totalTime.toFixed(2)}ms\`);
}

// Run tests when this file is executed
runTests();
`,
  python: `# Write your solution function below
def solution(input):
    # Your implementation here
    
    return result

# Driver code - DO NOT MODIFY BELOW THIS LINE
# This code will automatically run your solution with test cases
def run_tests():
    test_cases = [
        # Test cases will be inserted here
    ]
    
    passed_count = 0
    total_time = 0
    
    print("Running test cases...")
    
    for i, test_case in enumerate(test_cases):
        print(f"\\nTest Case {i + 1}:")
        print(f"Input: {test_case['input']}")
        
        import time
        start_time = time.time()
        result = solution(test_case['input'])
        end_time = time.time()
        execution_time = (end_time - start_time) * 1000  # Convert to ms
        total_time += execution_time
        
        print(f"Output: {result}")
        print(f"Expected: {test_case['output']}")
        
        passed = str(result) == test_case['output']
        if passed:
            passed_count += 1
            print("Status: PASSED")
        else:
            print("Status: FAILED")
        
        print(f"Execution Time: {execution_time:.2f}ms")
    
    print(f"\\nSummary: {passed_count}/{len(test_cases)} tests passed")
    print(f"Total Execution Time: {total_time:.2f}ms")

# Run tests when this file is executed
if __name__ == "__main__":
    run_tests()
`,
  java: `// Write your solution class below
class Solution {
    public Object solution(String input) {
        // Your implementation here
        
        return result;
    }
}

// Driver code - DO NOT MODIFY BELOW THIS LINE
// This code will automatically run your solution with test cases
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        
        // Test cases will be inserted here
        String[][] testCases = {
            // Test cases will be inserted here
        };
        
        int passedCount = 0;
        long totalTime = 0;
        
        System.out.println("Running test cases...");
        
        for (int i = 0; i < testCases.length; i++) {
            String[] testCase = testCases[i];
            System.out.println("\\nTest Case " + (i + 1) + ":");
            System.out.println("Input: " + testCase[0]);
            
            long startTime = System.nanoTime();
            Object result = solution.solution(testCase[0]);
            long endTime = System.nanoTime();
            long executionTime = (endTime - startTime) / 1_000_000; // Convert to ms
            totalTime += executionTime;
            
            System.out.println("Output: " + result);
            System.out.println("Expected: " + testCase[1]);
            
            boolean passed = result.toString().equals(testCase[1]);
            if (passed) {
                passedCount++;
                System.out.println("Status: PASSED");
            } else {
                System.out.println("Status: FAILED");
            }
            
            System.out.println("Execution Time: " + executionTime + "ms");
        }
        
        System.out.println("\\nSummary: " + passedCount + "/" + testCases.length + " tests passed");
        System.out.println("Total Execution Time: " + totalTime + "ms");
    }
}
`,
  cpp: `// Write your solution function below
#include <vector>
#include <iostream>
#include <string>
#include <sstream>
#include <chrono>

// Your solution function will be inserted here
// Example: void solution(vector<int>& nums, int target) { ... }

// Driver code - DO NOT MODIFY BELOW THIS LINE
// This code will automatically run your solution with test cases
int main() {
    // Test cases will be inserted here
    vector<pair<string, string>> testCases = {
        // Test cases will be inserted here
    };
    
    int passedCount = 0;
    double totalTime = 0;
    
    cout << "Running test cases..." << endl;
    
    for (int i = 0; i < testCases.size(); i++) {
        auto testCase = testCases[i];
        cout << "\\nTest Case " << (i + 1) << ":" << endl;
        cout << "Input: " << testCase.first << endl;
        
        auto startTime = chrono::high_resolution_clock::now();
        
        // Parse input and call solution function
        // This will be customized based on the question
        // Example: vector<int> nums = parseInput(testCase.first);
        // solution(nums, target);
        
        auto endTime = chrono::high_resolution_clock::now();
        auto duration = chrono::duration_cast<chrono::microseconds>(endTime - startTime);
        double executionTime = duration.count() / 1000.0; // Convert to ms
        totalTime += executionTime;
        
        // Get result and compare with expected output
        string result = "result"; // This will be replaced with actual result
        cout << "Output: " << result << endl;
        cout << "Expected: " << testCase.second << endl;
        
        bool passed = result == testCase.second;
        if (passed) {
            passedCount++;
            cout << "Status: PASSED" << endl;
        } else {
            cout << "Status: FAILED" << endl;
        }
        
        cout << "Execution Time: " << executionTime << "ms" << endl;
    }
    
    cout << "\\nSummary: " << passedCount << "/" << testCases.size() << " tests passed" << endl;
    cout << "Total Execution Time: " << totalTime << "ms" << endl;
    
    return 0;
}
`
};

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  onRun?: (code: string, language: string) => void;
  onSubmit?: (code: string, language: string) => void;
  question?: {
    id: string;
    title: string;
    test_cases: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
  };
}

const generateSolutionFunction = (question: CodeEditorProps['question'], language: SupportedLanguage): string => {
  if (!question) return '';
  
  // Convert question title to camelCase for function name
  const functionName = question.title
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
  
  switch (language) {
    case 'javascript':
      return `function ${functionName}(input) {
  // Your implementation here
  
  return result;
}`;
    case 'python':
      return `def ${functionName}(input):
    # Your implementation here
    
    return result`;
    case 'java':
      return `public Object ${functionName}(String input) {
    // Your implementation here
    
    return result;
}`;
    case 'cpp':
      return `void ${functionName}(vector<int>& nums, int target) {
    // Your implementation here
    
}`;
    default:
      return '';
  }
};

const insertTestCases = (template: string, question: CodeEditorProps['question'], language: SupportedLanguage): string => {
  if (!question || !question.test_cases) return template;
  
  const testCasesStr = question.test_cases.map(testCase => {
    switch (language) {
      case 'javascript':
        return `  {
    input: ${testCase.input},
    output: ${testCase.output}
  }`;
      case 'python':
        return `    {
        'input': ${testCase.input},
        'output': ${testCase.output}
    }`;
      case 'java':
        return `    {"${testCase.input}", "${testCase.output}"}`;
      case 'cpp':
        return `    {"${testCase.input}", "${testCase.output}"}`;
      default:
        return '';
    }
  }).join(',\n');
  
  return template.replace(
    '// Test cases will be inserted here',
    testCasesStr
  );
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  onLanguageChange,
  onRun,
  onSubmit,
  question
}) => {
  const [code, setCode] = useState<string>(value);
  const [lineCount, setLineCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [judge0Result, setJudge0Result] = useState<string | null>(null);
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);

  const updateLineCount = (text: string) => {
    const lines = text.split('\n').length;
    setLineCount(lines);
  };

  // Update code when language changes or initial code changes
  useEffect(() => {
    if (value) {
      setCode(value);
      updateLineCount(value);
    } else {
      setCode(languageTemplates[language]);
      updateLineCount(languageTemplates[language]);
    }
  }, [language, value]);

  // Update line count when code changes
  useEffect(() => {
    updateLineCount(code);
  }, [code]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onChange(newCode);
  };

  const handleLanguageChange = (e: SelectChangeEvent<SupportedLanguage>) => {
    const newLanguage = e.target.value as SupportedLanguage;
    onLanguageChange(newLanguage);
    
    // Generate new template with test cases and solution function
    let newTemplate = languageTemplates[newLanguage];
    if (question) {
      const solutionFunction = generateSolutionFunction(question, newLanguage);
      newTemplate = newTemplate.replace(
        /\/\/ Write your solution function below[\s\S]*?return result;/,
        solutionFunction
      );
      newTemplate = insertTestCases(newTemplate, question, newLanguage);
    }
    
    onChange(newTemplate);
  };

  const handleRun = () => {
    if (onRun) {
      // Make sure we're using the latest code from the textarea
      let updatedCode = code;
      if (internalTextareaRef && internalTextareaRef.current) {
        updatedCode = internalTextareaRef.current.value || code;
        setCode(updatedCode);
      }
      setIsLoading(true);
      onRun(updatedCode, language);
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      // Make sure we're using the latest code from the textarea
      let updatedCode = code;
      if (internalTextareaRef && internalTextareaRef.current) {
        updatedCode = internalTextareaRef.current.value || code;
        setCode(updatedCode);
      }
      setIsLoading(true);
      onSubmit(updatedCode, language);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const template = languageTemplates[language];
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
        if (internalTextareaRef && internalTextareaRef.current) {
          internalTextareaRef.current.selectionStart = selectionStart + 2;
          internalTextareaRef.current.selectionEnd = selectionStart + 2;
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

  const handleRunWithJudge0 = async () => {
    if (!question || !question.test_cases || question.test_cases.length === 0) {
      console.log('No test cases available for direct execution');
      return;
    }

    setIsLoading(true);
    setJudge0Result(null);

    try {
      // Get the first test case
      const testCase = question.test_cases[0];
      
      // Get the latest code from the textarea
      let updatedCode = code;
      if (internalTextareaRef && internalTextareaRef.current) {
        updatedCode = internalTextareaRef.current.value || code;
        setCode(updatedCode);
      }
      
      console.log(`Executing ${language} code with Judge0`);
      const result = await judge0Service.executeCode(
        updatedCode,
        language,
        testCase.input
      );
      
      console.log('Judge0 execution result:', result);
      
      // Format the result for display
      let resultText = '';
      
      if (result.status.id === JUDGE0_STATUS.ACCEPTED) {
        const actualOutput = result.stdout?.trim() || "";
        const expectedOutput = testCase.output.trim();
        const passed = actualOutput === expectedOutput;
        
        resultText = `Direct Execution Result:\n`;
        resultText += `Input: ${testCase.input}\n`;
        resultText += `Expected Output: ${expectedOutput}\n`;
        resultText += `Actual Output: ${actualOutput}\n`;
        resultText += `Status: ${passed ? 'PASSED' : 'FAILED'}\n`;
        resultText += `Execution Time: ${result.time || 0}ms\n`;
        
        if (result.stderr) {
          resultText += `\nError Output:\n${result.stderr}\n`;
        }
      } else {
        resultText = `Execution Error:\n`;
        resultText += `Status: ${result.status.description}\n`;
        
        if (result.stderr) {
          resultText += `\nError Output:\n${result.stderr}\n`;
        }
        
        if (result.compile_output) {
          resultText += `\nCompilation Output:\n${result.compile_output}\n`;
        }
      }
      
      setJudge0Result(resultText);
    } catch (error) {
      console.error('Error executing with Judge0:', error);
      setJudge0Result(`Error executing with Judge0: ${error}`);
    } finally {
      setIsLoading(false);
    }
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
          {question?.title || "Code Editor"}
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
      
      {/* Editor content */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Line numbers */}
        <Box
          sx={{
            width: '40px',
            backgroundColor: '#f5f5f5',
            borderRight: '1px solid #eaeaea',
            p: 1,
            fontFamily: 'monospace',
            fontSize: '14px',
            overflowY: 'auto',
            userSelect: 'none'
          }}
        >
          {renderLineNumbers()}
        </Box>
        
        {/* Code editor */}
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <textarea
            ref={internalTextareaRef}
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              height: '100%',
              padding: '16px',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.5',
              backgroundColor: '#ffffff'
            }}
          />
        </Box>
      </Box>
      
      {/* Editor footer */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderTop: '1px solid #eaeaea',
          backgroundColor: '#fafafa'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {lineCount} lines
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={handleRun}
            disabled={isLoading}
          >
            Run Tests
          </Button>
          
          {question && question.test_cases && question.test_cases.length > 0 && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CodeIcon />}
              onClick={handleRunWithJudge0}
              disabled={isLoading}
            >
              Run with Judge0
            </Button>
          )}
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<SendIcon />}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            Submit
          </Button>
        </Stack>
      </Box>
      
      {/* Judge0 Result */}
      {judge0Result && (
        <Box sx={{ p: 2, borderTop: '1px solid #eaeaea' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Judge0 Execution Result
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              backgroundColor: '#f9f9f9',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              maxHeight: '200px',
              overflow: 'auto'
            }}
          >
            {judge0Result}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default CodeEditor; 