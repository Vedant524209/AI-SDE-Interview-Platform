# InterviewXpert

A web application for interview preparation with user authentication.

## Features

- User authentication (signup and login)
- Secure password storage with bcrypt
- MySQL database integration
- Authentication activity logging and monitoring
- Modern UI with Material-UI
- Responsive design for all devices

## Prerequisites

- Node.js (v12 or higher)
- MySQL server installed and running
- Git

## Setup

1. Clone the repository:
```bash
git clone https://github.com/Vedant524209/AI-SDE-Interview-Platform.git
cd interviewxpert
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
   - Create a MySQL database named `interviewxpert`
   - Update the credentials in `.env` file:
```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=interviewxpert
DB_PORT=3306
PORT=5000
```

4. Run the application:
```bash
npm run dev
```
This will start both the backend server (on port 5000) and the frontend React application (on port 3000).

## Database Schema

The application uses the following database schema:

**Users Table:**
- `id`: Auto-incrementing primary key
- `email`: User's email address (unique)
- `password`: Hashed password
- `created_at`: Timestamp of account creation

**Auth_Logs Table:**
- `id`: Auto-incrementing primary key
- `user_id`: Foreign key referencing users.id (can be NULL for failed logins)
- `email`: Email address used in the authentication attempt
- `action`: Type of action (LOGIN, SIGNUP)
- `status`: Result of the action (SUCCESS, FAILED_VALIDATION, USER_EXISTS, INVALID_CREDENTIALS, ERROR)
- `ip_address`: IP address of the client
- `user_agent`: User agent string from the client
- `created_at`: Timestamp of the log entry

## API Endpoints

The backend provides the following API endpoints:

- `POST /api/signup`: Register a new user
  - Body: `{ "email": "user@example.com", "password": "password123" }`
  - Response: `{ "message": "User created successfully", "userId": 1 }`

- `POST /api/login`: Authenticate a user
  - Body: `{ "email": "user@example.com", "password": "password123" }`
  - Response: `{ "message": "Login successful", "user": { "id": 1, "email": "user@example.com" } }`

- `GET /api/test`: Test database connection
  - Response: `{ "message": "Database connection successful", "data": [...] }`

- `GET /api/auth-logs`: Retrieve recent authentication logs
  - Response: `{ "logs": [...] }`

## Logging System

The application includes a comprehensive logging system that tracks all authentication activities:

- **Login attempts**: Both successful and failed 
- **Signup activities**: New user registrations and duplicate attempts
- **Security information**: IP addresses and user agents are recorded
- **Error tracking**: All errors during authentication flow are logged

This data can be used for:
- Security monitoring and threat detection
- Identifying suspicious login patterns
- Troubleshooting authentication issues
- Compliance and audit purposes

## Future Enhancements

- Add JWT authentication for maintaining sessions
- Add more user profile fields
- Implement password recovery
- Add user roles and permissions
- Create an admin dashboard for log analysis
- Implement rate limiting to prevent brute force attacks
