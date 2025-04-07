import os
import requests
import time
import logging
from typing import Dict, Any, Optional, List, Tuple

# Configure logging
logger = logging.getLogger(__name__)

# Judge0 API Configuration for RapidAPI
JUDGE0_API_URL = os.environ.get("JUDGE0_API_URL", "https://judge0-ce.p.rapidapi.com")
JUDGE0_API_KEY = os.environ.get("JUDGE0_API_KEY", "default_key_for_development")

# Check if using default key
if JUDGE0_API_KEY == "default_key_for_development" or JUDGE0_API_KEY == "your_rapidapi_key_here":
    logger.warning("Using default Judge0 API key. This is for development only and may not work in production.")
    logger.warning("Please set a valid JUDGE0_API_KEY in your .env file for production use.")

# Rate limiting configuration
MAX_RETRIES = 3  # Reduced from 5 to 3
RETRY_DELAY = 1  # Reduced from 2 to 1 second
REQUEST_DELAY = 0.5  # Reduced from 1.0 to 0.5 seconds between requests
MAX_RATE_LIMIT_RETRIES = 5  # Reduced from 10 to 5
RATE_LIMIT_BACKOFF_FACTOR = 1.5  # Reduced from 2 to 1.5 for more gradual backoff
MAX_BACKOFF_DELAY = 10  # Maximum delay in seconds

# Language IDs for Judge0
LANGUAGE_IDS = {
    "javascript": 63,  # JavaScript (Node.js 12.14.0)
    "python": 71,     # Python (3.8.1)
    "java": 62,       # Java (OpenJDK 13.0.1)
    "cpp": 54,        # C++ (GCC 9.2.0)
}

class Judge0Service:
    def __init__(self):
        self.base_url = JUDGE0_API_URL
        self.headers = {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": JUDGE0_API_KEY,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
        }
        self._check_connection()

    def _check_connection(self):
        """Check if Judge0 service is available."""
        try:
            # Try to connect to Judge0 service
            response = requests.get(f"{self.base_url}/languages", headers=self.headers, timeout=5)
            response.raise_for_status()
            logger.info("Judge0 service is available")
        except Exception as e:
            logger.error(f"Failed to connect to Judge0 service: {str(e)}")
            # Don't raise the error, just log it and continue
            # This allows the application to start even if Judge0 is not available
            logger.warning("Judge0 service is not available. Code execution will fail.")

    def _get_language_id(self, language: str) -> int:
        """Get the Judge0 language ID for the given language."""
        return LANGUAGE_IDS.get(language.lower(), LANGUAGE_IDS["python"])

    def _handle_rate_limit(self, retry_count: int, rate_limit_retry_count: int = 0) -> bool:
        """Handle rate limiting by implementing exponential backoff."""
        # First check if we've exceeded the maximum rate limit retries
        if rate_limit_retry_count >= MAX_RATE_LIMIT_RETRIES:
            logger.error(f"Maximum rate limit retries ({MAX_RATE_LIMIT_RETRIES}) exceeded")
            return False
            
        # Calculate delay with exponential backoff, capped at MAX_BACKOFF_DELAY
        delay = min(RETRY_DELAY * (RATE_LIMIT_BACKOFF_FACTOR ** rate_limit_retry_count), MAX_BACKOFF_DELAY)
        logger.info(f"Rate limited, retrying in {delay} seconds... (attempt {rate_limit_retry_count + 1}/{MAX_RATE_LIMIT_RETRIES})")
        time.sleep(delay)
        return True

    def _make_request(self, method: str, url: str, data: Dict = None, retry_count: int = 0, rate_limit_retry_count: int = 0) -> Dict:
        """Make a request to the Judge0 API with rate limit handling."""
        try:
            if method.lower() == 'get':
                response = requests.get(url, headers=self.headers, timeout=5)  # Reduced from 10 to 5 seconds
            else:
                response = requests.post(url, json=data, headers=self.headers, timeout=5)  # Reduced from 10 to 5 seconds
                
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:  # Rate limited
                if self._handle_rate_limit(retry_count, rate_limit_retry_count):
                    return self._make_request(method, url, data, retry_count, rate_limit_retry_count + 1)
                else:
                    logger.error("Rate limit exceeded maximum retries")
                    raise
            raise
        except Exception as e:
            logger.error(f"Error making request to Judge0 API: {str(e)}")
            raise

    def create_submission(self, code: str, language: str, stdin: str = "", retry_count: int = 0) -> Dict[str, Any]:
        """Create a new submission in Judge0."""
        try:
            url = f"{self.base_url}/submissions"
            payload = {
                "source_code": code,
                "language_id": self._get_language_id(language),
                "stdin": stdin
            }
            
            return self._make_request('post', url, payload, retry_count)
        except Exception as e:
            logger.error(f"Error creating submission: {str(e)}")
            raise

    def get_submission(self, token: str, retry_count: int = 0) -> Dict[str, Any]:
        """Get the results of a submission."""
        try:
            url = f"{self.base_url}/submissions/{token}"
            return self._make_request('get', url, retry_count=retry_count)
        except Exception as e:
            logger.error(f"Error getting submission: {str(e)}")
            raise

    def _format_input_for_language(self, language: str, stdin: str) -> str:
        """Format input based on the programming language."""
        if language.lower() == 'cpp':
            # For C++, ensure input is properly formatted
            return stdin.strip()
        return stdin

    def execute_code(self, code: str, language: str, stdin: str = "", timeout: int = 15) -> Dict[str, Any]:
        """Execute code and return the results."""
        try:
            # Format input based on language
            formatted_stdin = self._format_input_for_language(language, stdin)
            
            # Create submission
            submission = self.create_submission(code, language, formatted_stdin)
            token = submission["token"]

            # Add delay between requests
            time.sleep(REQUEST_DELAY)

            # Wait for execution to complete
            start_time = time.time()
            while time.time() - start_time < timeout:
                result = self.get_submission(token)
                if result["status"]["id"] not in [1, 2]:  # 1: In Queue, 2: Processing
                    # Format output based on language
                    if result["stdout"]:
                        result["stdout"] = result["stdout"].strip()
                    return result
                time.sleep(REQUEST_DELAY)

            # If we reach here, the execution timed out
            return {
                "status": {"id": 4, "description": "Time Limit Exceeded"},
                "stdout": None,
                "stderr": "Execution timed out",
                "time": timeout,
                "memory": None
            }
        except Exception as e:
            logger.error(f"Error executing code: {str(e)}")
            raise
            
    def batch_execute_code(self, code: str, language: str, test_cases: List[Dict[str, str]], timeout: int = 30) -> List[Dict[str, Any]]:
        """Execute code against multiple test cases with rate limiting."""
        try:
            # Create submissions for all test cases with delay between requests
            submissions = []
            for test_case in test_cases:
                # Format input based on language
                formatted_input = self._format_input_for_language(language, test_case.get("input", ""))
                submission = self.create_submission(code, language, formatted_input)
                submissions.append({
                    "token": submission["token"],
                    "test_case": test_case
                })
                time.sleep(REQUEST_DELAY)
            
            # Wait for all executions to complete
            results = []
            start_time = time.time()
            
            # Optimized polling strategy
            while submissions and time.time() - start_time < timeout:
                # Check each submission that hasn't completed yet
                completed_submissions = []
                
                # Process submissions in batches to reduce API calls
                for i, submission in enumerate(submissions):
                    # Only check every 3rd submission to reduce API calls
                    if i % 3 == 0:
                        try:
                            result = self.get_submission(submission["token"])
                            if result["status"]["id"] not in [1, 2]:  # 1: In Queue, 2: Processing
                                # Add the result and mark for removal
                                results.append({
                                    "test_case": submission["test_case"],
                                    "result": result
                                })
                                completed_submissions.append(submission)
                        except Exception as e:
                            logger.error(f"Error checking submission status: {str(e)}")
                            # Don't remove the submission, let it retry
                
                # Remove completed submissions
                for submission in completed_submissions:
                    submissions.remove(submission)
                
                # If all submissions are complete, break
                if not submissions:
                    break
                    
                # Add a longer delay between polling cycles to reduce API calls
                time.sleep(REQUEST_DELAY * 2)  # Increased from REQUEST_DELAY to REQUEST_DELAY * 2
            
            # If we still have submissions after timeout, mark them as timed out
            for submission in submissions:
                results.append({
                    "test_case": submission["test_case"],
                    "result": {
                        "status": {"id": 4, "description": "Time Limit Exceeded"},
                        "stdout": None,
                        "stderr": "Execution timed out",
                        "time": timeout,
                        "memory": None
                    }
                })
            
            return results
        except Exception as e:
            logger.error(f"Error in batch execution: {str(e)}")
            raise

# Create a singleton instance
judge0_service = Judge0Service() 