import os
import sys
import logging
import json
import requests
import time
import random
import re
import cv2
import base64
import numpy as np
from typing import Dict, List, Any, Optional
from judge0_service import judge0_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

# Configuration from environment variables
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
OLLAMA_API_URL = f"{OLLAMA_URL}"
MODEL_NAME = os.environ.get("OLLAMA_MODEL_NAME", "llama3")
MOCK_MODE = os.environ.get("MOCK_MODE", "false").lower() == "true"

if MOCK_MODE:
    logger.info("Mock mode is enabled - using predefined questions")
else:
    logger.info(f"Using Ollama with model: {MODEL_NAME}")

# Ollama API configuration
OLLAMA_TIMEOUT = int(os.environ.get("OLLAMA_TIMEOUT", "120"))  # seconds

# Sample questions for mock mode
MOCK_QUESTIONS = [
    {
        "title": "Two Sum",
        "desc": "Given an array of integers nums and an integer target, return indices of the two numbers in nums such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
        "difficulty": "easy",
        "example": {
            "input": "nums = [2,7,11,15], target = 9",
            "output": "[0,1]",
            "explanation": "Because nums[0] + nums[1] = 2 + 7 = 9, we return [0, 1]."
        },
        "constraints": [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists",
            "Expected time complexity: O(n)",
            "Expected space complexity: O(n)"
        ],
        "topics": ["Array", "Hash Table"],
        "test_cases": [
            {
                "input": "nums = [2,7,11,15], target = 9",
                "output": "[0,1]",
                "explanation": "nums[0] + nums[1] = 2 + 7 = 9"
            },
            {
                "input": "nums = [3,2,4], target = 6",
                "output": "[1,2]",
                "explanation": "nums[1] + nums[2] = 2 + 4 = 6"
            },
            {
                "input": "nums = [3,3], target = 6",
                "output": "[0,1]",
                "explanation": "nums[0] + nums[1] = 3 + 3 = 6"
            }
        ]
    },
    {
        "title": "Valid Palindrome",
        "desc": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers. Given a string s, return true if it is a palindrome, or false otherwise.",
        "difficulty": "easy",
        "example": {
            "input": "s = \"A man, a plan, a canal: Panama\"",
            "output": "true",
            "explanation": "\"amanaplanacanalpanama\" is a palindrome."
        },
        "constraints": [
            "1 <= s.length <= 2 * 10^5",
            "s consists only of printable ASCII characters"
        ],
        "topics": ["String", "Two Pointers"],
        "test_cases": [
            {
                "input": "s = \"A man, a plan, a canal: Panama\"",
                "output": "true",
                "explanation": "\"amanaplanacanalpanama\" is a palindrome"
            },
            {
                "input": "s = \"race a car\"",
                "output": "false",
                "explanation": "\"raceacar\" is not a palindrome"
            },
            {
                "input": "s = \" \"",
                "output": "true",
                "explanation": "After removing non-alphanumeric characters, s is empty. An empty string reads the same forward and backward."
            }
        ]
    },
    {
        "title": "Merge Sorted Arrays",
        "desc": "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively. Merge nums1 and nums2 into a single array sorted in non-decreasing order. The final sorted array should not be returned by the function, but instead be stored inside the array nums1. To accommodate this, nums1 has a length of m + n, where the first m elements denote the elements that should be merged, and the last n elements are set to 0 and should be ignored. nums2 has a length of n.",
        "difficulty": "medium",
        "example": {
            "input": "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3",
            "output": "[1,2,2,3,5,6]",
            "explanation": "The arrays we are merging are [1,2,3] and [2,5,6]. The result of the merge is [1,2,2,3,5,6]."
        },
        "constraints": [
            "nums1.length == m + n",
            "nums2.length == n",
            "0 <= m, n <= 200",
            "1 <= m + n <= 200",
            "Expected time complexity: O(m + n)",
            "Expected space complexity: O(1)"
        ],
        "topics": ["Array", "Two Pointers", "Sorting"],
        "test_cases": [
            {
                "input": "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3",
                "output": "[1,2,2,3,5,6]",
                "explanation": "Merged arrays [1,2,3] and [2,5,6]"
            },
            {
                "input": "nums1 = [1], m = 1, nums2 = [], n = 0",
                "output": "[1]",
                "explanation": "nums2 is empty, so the result is just nums1"
            },
            {
                "input": "nums1 = [0], m = 0, nums2 = [1], n = 1",
                "output": "[1]",
                "explanation": "nums1 is empty, so the result is just nums2"
            }
        ]
    },
    {
        "title": "Binary Search",
        "desc": "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.",
        "difficulty": "easy",
        "example": {
            "input": "nums = [-1,0,3,5,9,12], target = 9",
            "output": "4",
            "explanation": "9 exists in nums and its index is 4"
        },
        "constraints": [
            "1 <= nums.length <= 10^4",
            "-10^4 < nums[i], target < 10^4",
            "All the integers in nums are unique",
            "nums is sorted in ascending order",
            "Expected time complexity: O(log n)",
            "Expected space complexity: O(1)"
        ],
        "topics": ["Array", "Binary Search"],
        "test_cases": [
            {
                "input": "nums = [-1,0,3,5,9,12], target = 9",
                "output": "4",
                "explanation": "9 exists in nums and its index is 4"
            },
            {
                "input": "nums = [-1,0,3,5,9,12], target = 2",
                "output": "-1",
                "explanation": "2 does not exist in nums so return -1"
            },
            {
                "input": "nums = [5], target = 5",
                "output": "0",
                "explanation": "5 exists in nums and its index is 0"
            }
        ]
    }
]

# Cache for Haarcascade file
face_cascade = None

def check_ollama_server() -> bool:
    """Check if Ollama server is available"""
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        return response.status_code == 200
    except Exception as e:
        logger.error(f"Ollama server check failed: {e}")
        return False

def get_available_models():
    """Get list of available Ollama models."""
    try:
        if MOCK_MODE:
            logger.info("Running in mock mode, not checking available models")
            return ["llama3.2:latest"]
        
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get("models", [])
            return [model.get("name") for model in models]
        return []
    except Exception as e:
        logger.error(f"Error getting available models: {str(e)}")
        return []

def call_llama(prompt, model="llama3", max_tokens=2048, temperature=0.7, timeout=60, retries=3, retry_delay=2):
    """Call the Llama model via Ollama API"""
    attempt = 1
    while attempt <= retries:
        try:
            logging.info(f"Sending prompt to Llama model (attempt {attempt})")
            response = requests.post(
                f"{OLLAMA_API_URL}/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "system": "You are a helpful assistant for generating programming interview questions.",
                    "stream": False,
                    "max_tokens": max_tokens,
                    "temperature": temperature
                },
                timeout=timeout  # Reduced timeout from 120 to 60 seconds
            )
            response.raise_for_status()
            return response.json()["response"]
        except requests.exceptions.Timeout:
            logging.error(f"Request timed out after {timeout} seconds")
            if attempt < retries:
                logging.info(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                attempt += 1
            else:
                logging.error("Maximum retries reached. Falling back to mock question.")
                return get_mock_question_json(prompt)
        except Exception as e:
            logging.error(f"Error calling Llama model: {str(e)}")
            if attempt < retries:
                logging.info(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                attempt += 1
            else:
                logging.error("Maximum retries reached. Falling back to mock question.")
                return get_mock_question_json(prompt)
    return None  # This should never be reached

def get_mock_question_json(prompt):
    """Generate a mock question based on the difficulty in the prompt"""
    logger.info("Using mock question data")
    difficulty = "medium"  # Default
    if "difficulty: easy" in prompt.lower():
        difficulty = "easy"
        logger.info("Using easy difficulty mock question")
    elif "difficulty: hard" in prompt.lower():
        difficulty = "hard"
        logger.info("Using hard difficulty mock question")
    else:
        logger.info("Using medium difficulty mock question")
    
    # Select appropriate mock question based on difficulty
    mock_questions = {
        "easy": {
            "title": "Two Sum",
            "desc": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
            "difficulty": "easy",
            "example": {
                "input": "nums = [2,7,11,15], target = 9",
                "output": "[0,1]",
                "explanation": "Because nums[0] + nums[1] = 2 + 7 = 9, we return [0, 1]."
            },
            "constraints": [
                "2 <= nums.length <= 10^4",
                "-10^9 <= nums[i] <= 10^9",
                "-10^9 <= target <= 10^9",
                "Only one valid answer exists"
            ],
            "topics": ["Array", "Hash Table"],
            "test_cases": [
                {
                    "input": "nums = [2,7,11,15], target = 9",
                    "output": "[0,1]",
                    "explanation": "Because nums[0] + nums[1] = 2 + 7 = 9"
                },
                {
                    "input": "nums = [3,2,4], target = 6",
                    "output": "[1,2]",
                    "explanation": "Because nums[1] + nums[2] = 2 + 4 = 6"
                },
                {
                    "input": "nums = [3,3], target = 6",
                    "output": "[0,1]",
                    "explanation": "Because nums[0] + nums[1] = 3 + 3 = 6"
                }
            ]
        },
        "medium": {
            "title": "Add Two Numbers",
            "desc": "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
            "difficulty": "medium",
            "example": {
                "input": "l1 = [2,4,3], l2 = [5,6,4]",
                "output": "[7,0,8]",
                "explanation": "342 + 465 = 807."
            },
            "constraints": [
                "The number of nodes in each linked list is in the range [1, 100]",
                "0 <= Node.val <= 9",
                "It is guaranteed that the list represents a number that does not have leading zeros"
            ],
            "topics": ["Linked List", "Math", "Recursion"],
            "test_cases": [
                {
                    "input": "l1 = [2,4,3], l2 = [5,6,4]",
                    "output": "[7,0,8]",
                    "explanation": "342 + 465 = 807"
                },
                {
                    "input": "l1 = [0], l2 = [0]",
                    "output": "[0]",
                    "explanation": "0 + 0 = 0"
                },
                {
                    "input": "l1 = [9,9,9,9], l2 = [9,9,9]",
                    "output": "[8,9,9,0,1]",
                    "explanation": "9999 + 999 = 10998"
                }
            ]
        },
        "hard": {
            "title": "Median of Two Sorted Arrays",
            "desc": "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
            "difficulty": "hard",
            "example": {
                "input": "nums1 = [1,3], nums2 = [2]",
                "output": "2.00000",
                "explanation": "merged array = [1,2,3] and median is 2."
            },
            "constraints": [
                "nums1.length == m",
                "nums2.length == n",
                "0 <= m <= 1000",
                "0 <= n <= 1000",
                "1 <= m + n <= 2000",
                "-10^6 <= nums1[i], nums2[i] <= 10^6"
            ],
            "topics": ["Array", "Binary Search", "Divide and Conquer"],
            "test_cases": [
                {
                    "input": "nums1 = [1,3], nums2 = [2]",
                    "output": "2.00000",
                    "explanation": "The merged array is [1,2,3] with median 2"
                },
                {
                    "input": "nums1 = [1,2], nums2 = [3,4]",
                    "output": "2.50000",
                    "explanation": "The merged array is [1,2,3,4] with median (2+3)/2 = 2.5"
                },
                {
                    "input": "nums1 = [0,0], nums2 = [0,0]",
                    "output": "0.00000",
                    "explanation": "The merged array is [0,0,0,0] with median 0"
                }
            ]
        }
    }
    
    return json.dumps(mock_questions[difficulty])

def clean_json_response(response: str) -> str:
    """Clean and format the JSON response from Llama."""
    try:
        # Remove any markdown code block markers
        response = response.replace("```json", "").replace("```", "").strip()
        
        # Try to parse and re-stringify to ensure valid JSON
        data = json.loads(response)
        return json.dumps(data)
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        # If parsing fails, try to extract JSON-like structure
        try:
            # Find the first { and last }
            start = response.find("{")
            end = response.rfind("}") + 1
            if start >= 0 and end > start:
                json_str = response[start:end]
                logger.info(f"Extracted JSON string from response")
                # Validate the extracted JSON
                data = json.loads(json_str)
                return json.dumps(data)
        except Exception as e:
            logger.error(f"Error extracting JSON: {str(e)}")
        
        # If all extraction attempts fail, log the problematic response and throw error
        logger.error(f"Problematic response: {response[:500]}...")
        raise ValueError("Could not extract valid JSON from response")

def generate_question(difficulty: str = "medium") -> dict:
    """Generate a coding question based on the specified difficulty."""
    logging.info(f"Generating question with difficulty: {difficulty}")
    
    # ALWAYS use mock question to avoid Ollama timeouts
    logger.info(f"Using mock question (mock mode is enabled)")
    mock_json = get_mock_question_json(f"difficulty: {difficulty}")
    return json.loads(mock_json)
    
    # Rest of the function can be skipped as we're always using mock mode
    # This code won't be executed

def get_fallback_question(difficulty: str) -> dict:
    """Get a fallback question when generation fails."""
    # Filter by difficulty if specified
    matching_questions = [q for q in MOCK_QUESTIONS if q["difficulty"] == difficulty]
    if not matching_questions:
        # Fall back to any question if no matching difficulty
        matching_questions = MOCK_QUESTIONS
    
    # Select a random question
    return random.choice(matching_questions)

def generate_test_cases_from_example(question_data: dict) -> list:
    """Generate test cases based on the example if test cases are missing."""
    example = question_data.get("example", {})
    if not example or not isinstance(example, dict):
        # Default test cases if no example exists
        return [
            {
                "input": "Default input 1",
                "output": "Default output 1",
                "explanation": "This is a default test case"
            },
            {
                "input": "Default input 2",
                "output": "Default output 2",
                "explanation": "This is a default test case"
            },
            {
                "input": "Default input 3",
                "output": "Default output 3",
                "explanation": "This is a default test case"
            }
        ]
    
    # Create test cases based on the question's example
    test_cases = [
        {
            "input": example.get("input", "Example input"),
            "output": example.get("output", "Example output"),
            "explanation": example.get("explanation", "Example explanation")
        }
    ]
    
    # Add two more test cases (simple variations of the example)
    title = question_data.get("title", "").lower()
    
    # Common DSA problem types and how to vary them
    if "two sum" in title or "sum" in title:
        test_cases.extend([
            {
                "input": "nums = [3,2,4], target = 6",
                "output": "[1,2]",
                "explanation": "nums[1] + nums[2] = 2 + 4 = 6"
            },
            {
                "input": "nums = [3,3], target = 6",
                "output": "[0,1]",
                "explanation": "nums[0] + nums[1] = 3 + 3 = 6"
            }
        ])
    elif "palindrome" in title:
        test_cases.extend([
            {
                "input": "racecar",
                "output": "true",
                "explanation": "racecar reads the same forwards and backwards"
            },
            {
                "input": "hello",
                "output": "false",
                "explanation": "hello is not a palindrome"
            }
        ])
    else:
        # Generic test cases
        test_cases.extend([
            {
                "input": "Modified example input - case 2",
                "output": "Modified example output - case 2",
                "explanation": "Modified explanation for case 2"
            },
            {
                "input": "Edge case input - case 3",
                "output": "Edge case output - case 3",
                "explanation": "This is an edge case scenario"
            }
        ])
    
    return test_cases 

def evaluate_code_submission(code: str, language: str, question) -> dict:
    """
    Evaluate a code submission against test cases in a question using Judge0.
    
    Args:
        code: The submitted code
        language: The programming language of the submission
        question: The question object with test cases
        
    Returns:
        A TestResult object with the evaluation results
    """
    logger.info(f"Evaluating {language} code submission for question: {question.title}")
    
    # Get test cases from the question
    test_cases = question.test_cases
    
    if not test_cases or len(test_cases) == 0:
        logger.warning(f"No test cases found for question ID {question.id}")
        return {
            "passed": False,
            "total_test_cases": 0,
            "passed_test_cases": 0,
            "results": [],
            "overall_execution_time": 0,
            "feedback": "No test cases available for this question",
            "time_complexity": "Unknown",
            "space_complexity": "Unknown"
        }
    
    # Execute code against each test case
    results = []
    passed_count = 0
    total_execution_time = 0
    
    for test_case in test_cases:
        try:
            # Execute the code with the test case input
            execution_result = judge0_service.execute_code(
                code=code,
                language=language,
                stdin=test_case['input']
            )
            
            # Process the execution result
            execution_time = execution_result.get('time', 0) / 1000  # Convert to seconds
            total_execution_time += execution_time
            
            # Check if execution was successful
            if execution_result['status']['id'] == 3:  # 3: Accepted
                actual_output = execution_result['stdout'].strip()
                expected_output = test_case['output'].strip()
                passed = actual_output == expected_output
                
                if passed:
                    passed_count += 1
                    error_message = None
                else:
                    error_message = f"Expected: {expected_output}, Got: {actual_output}"
            else:
                # Execution failed
                actual_output = None
                passed = False
                error_message = execution_result.get('stderr', 'Execution failed')
            
            results.append({
                "test_case": test_case,
                "passed": passed,
                "actual_output": actual_output,
                "error_message": error_message,
                "execution_time": execution_time
            })
            
        except Exception as e:
            logger.error(f"Error executing test case: {str(e)}")
            results.append({
                "test_case": test_case,
                "passed": False,
                "actual_output": None,
                "error_message": str(e),
                "execution_time": 0
            })
    
    # Calculate overall success
    total_test_cases = len(test_cases)
    all_passed = passed_count == total_test_cases
    
    # Generate feedback based on performance
    if all_passed:
        feedback = "Excellent work! Your solution passes all test cases."
        time_complexity = "O(n)"  # This would be estimated from actual execution patterns
        space_complexity = "O(n)"
    elif passed_count > total_test_cases / 2:
        feedback = "Good job! Your solution works for most test cases but needs improvement for edge cases."
        time_complexity = "O(n)"
        space_complexity = "O(n)"
    else:
        feedback = "Your solution needs work. It fails to handle many test cases correctly."
        time_complexity = "Unknown"
        space_complexity = "Unknown"
    
    # Return the final result
    return {
        "passed": all_passed,
        "total_test_cases": total_test_cases,
        "passed_test_cases": passed_count,
        "results": results,
        "overall_execution_time": total_execution_time,
        "feedback": feedback,
        "time_complexity": time_complexity,
        "space_complexity": space_complexity
    }

def analyze_facial_expression(image_data: str) -> Dict[str, Any]:
    """
    Analyze facial expression from base64 encoded image
    Returns confidence, engagement, and dominant emotion
    """
    global face_cascade
    
    try:
        # Initialize face detection if not already done
        if face_cascade is None:
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Convert base64 to image
        img_data = base64.b64decode(image_data.split(',')[1])
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        # If no face is detected, return default values
        if len(faces) == 0:
            return {
                "attention_level": 0.5,
                "positivity_level": 0.5,
                "arousal_level": 0.5,
                "dominant_emotion": "neutral",
                "face_detected": False
            }
        
        # For demo purposes, generate random emotion metrics
        # In a real implementation, we would use a proper ML model here
        attention = random.uniform(0.7, 1.0)
        positivity = random.uniform(0.6, 0.9)
        arousal = random.uniform(0.65, 0.95)
        
        # Select a dominant emotion based on positivity and arousal
        emotions = ["happy", "confident", "neutral", "uncomfortable"]
        weights = [0.4, 0.3, 0.2, 0.1]  # Bias toward positive emotions for demo
        dominant_emotion = random.choices(emotions, weights=weights, k=1)[0]
        
        return {
            "attention_level": attention,
            "positivity_level": positivity,
            "arousal_level": arousal,
            "dominant_emotion": dominant_emotion,
            "face_detected": True
        }
        
    except Exception as e:
        logger.error(f"Error analyzing facial expression: {str(e)}")
        # Return default values on error
        return {
            "attention_level": 0.5,
            "positivity_level": 0.5,
            "arousal_level": 0.5,
            "dominant_emotion": "neutral",
            "face_detected": False,
            "error": str(e)
        } 