from fastapi import HTTPException
import json
import requests
import time

# Ollama API configuration
OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.2:latest"

def check_ollama_server():
    """Check if Ollama server is running."""
    try:
        response = requests.get("http://localhost:11434/api/tags")
        print(f"Ollama server check response: {response.status_code}")
        return response.status_code == 200
    except requests.exceptions.ConnectionError as e:
        print(f"Ollama server connection error: {str(e)}")
        return False

def call_llama(prompt: str) -> str:
    """Call Llama model using Ollama API."""
    # Check if Ollama server is running
    if not check_ollama_server():
        raise HTTPException(
            status_code=503,
            detail="Ollama server is not running. Please start it with 'ollama serve'"
        )

    max_retries = 3
    retry_delay = 2  # seconds

    for attempt in range(max_retries):
        try:
            print(f"Sending prompt to Llama model (attempt {attempt + 1})")
            response = requests.post(
                OLLAMA_API_URL,
                json={
                    "model": MODEL_NAME,
                    "prompt": prompt,
                    "stream": False,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "top_k": 40
                },
                timeout=60  # 60 seconds timeout
            )
            response.raise_for_status()
            result = response.json()
            print(f"Llama model response received")
            return result["response"]
        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                print(f"Attempt {attempt + 1} failed: {str(e)}. Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print(f"Error calling Llama model: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to get response from Llama model after {max_retries} attempts"
                )

def clean_json_response(response: str) -> str:
    """Clean and format the JSON response from Llama."""
    try:
        # Remove any markdown code block markers
        response = response.replace("```json", "").replace("```", "").strip()
        
        # Try to parse and re-stringify to ensure valid JSON
        data = json.loads(response)
        return json.dumps(data)
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {str(e)}")
        # If parsing fails, try to extract JSON-like structure
        try:
            # Find the first { and last }
            start = response.find("{")
            end = response.rfind("}") + 1
            if start >= 0 and end > start:
                json_str = response[start:end]
                print(f"Extracted JSON string")
                # Validate the extracted JSON
                data = json.loads(json_str)
                return json.dumps(data)
        except Exception as e:
            print(f"Error extracting JSON: {str(e)}")
        raise ValueError("Could not extract valid JSON from response")

def generate_question(difficulty: str) -> dict:
    """Generate a DSA question using Llama model."""
    prompt = f"""You are a programming interview question generator that specializes in data structures and algorithms questions. 
Generate a detailed and challenging coding interview question with the following difficulty level: {difficulty}.

Please generate your response in the following JSON format:
{{
    "title": "A clear, concise title for the question",
    "desc": "Detailed description of the problem including context, requirements, and what the solution should return. Be thorough and clear.",
    "difficulty": "{difficulty}",
    "example": {{
        "input": "Example input in proper format",
        "output": "Example output in proper format",
        "explanation": "Step-by-step explanation of how the example works"
    }},
    "constraints": [
        "Time complexity requirements",
        "Space complexity requirements",
        "Input size limitations",
        "Range of values",
        "Other important constraints"
    ],
    "topics": [
        "Primary algorithm or data structure category",
        "Secondary topics that apply to this problem",
        "Specific techniques needed"
    ]
}}

Requirements:
1. Make sure your response is ONLY valid JSON that can be parsed directly - no additional text
2. For {difficulty} difficulty, adjust the complexity of the problem accordingly
3. Provide a thorough problem description that covers all edge cases
4. Include at least one detailed example with input, output and explanation
5. List specific constraints that would be important for an interview
6. Only include topics that are directly relevant to the problem

Example response format for an easy question:
{{
    "title": "Two Sum",
    "desc": "Given an array of integers nums and an integer target, return indices of the two numbers in nums such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    "difficulty": "easy",
    "example": {{
        "input": "nums = [2,7,11,15], target = 9",
        "output": "[0,1]",
        "explanation": "Because nums[0] + nums[1] = 2 + 7 = 9, we return [0, 1]."
    }},
    "constraints": [
        "2 <= nums.length <= 10^4",
        "-10^9 <= nums[i] <= 10^9",
        "-10^9 <= target <= 10^9",
        "Only one valid answer exists",
        "Expected time complexity: O(n)",
        "Expected space complexity: O(n)"
    ],
    "topics": [
        "Array",
        "Hash Table"
    ]
}}"""

    try:
        print(f"Generating question with difficulty: {difficulty}")
        # Call Llama model
        response = call_llama(prompt)
        
        # Clean and parse the response
        cleaned_response = clean_json_response(response)
        question_data = json.loads(cleaned_response)
        
        # Validate required fields
        required_fields = ["title", "desc", "difficulty"]
        for field in required_fields:
            if field not in question_data:
                raise ValueError(f"Missing required field: {field}")
        
        # Ensure constraints and topics are lists
        if "constraints" not in question_data or not isinstance(question_data["constraints"], list):
            question_data["constraints"] = []
        
        if "topics" not in question_data or not isinstance(question_data["topics"], list):
            question_data["topics"] = []
        
        return question_data
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to parse Llama response")
    except ValueError as e:
        print(f"Validation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"Error generating question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 