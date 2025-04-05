const { exec } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5002;

// For Windows, use netstat to find process using the port
if (process.platform === 'win32') {
  exec(`netstat -ano | findstr :${PORT}`, (error, stdout, stderr) => {
    if (stdout) {
      console.log(`Port ${PORT} is in use.`);
      
      // Extract PID and kill process
      const lines = stdout.trim().split('\n');
      const line = lines[0];
      const pid = line.trim().split(/\s+/).pop();
      
      if (pid) {
        console.log(`Attempting to kill process with PID: ${pid}`);
        exec(`taskkill /F /PID ${pid}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error killing process: ${error.message}`);
            return;
          }
          console.log(`Process with PID ${pid} killed.`);
        });
      }
    } else {
      console.log(`Port ${PORT} is free.`);
    }
  });
} else {
  // For Unix-based systems
  exec(`lsof -i:${PORT}`, (error, stdout, stderr) => {
    if (stdout) {
      console.log(`Port ${PORT} is in use.`);
      
      // Extract PID and kill process
      const lines = stdout.trim().split('\n');
      if (lines.length > 1) {
        const line = lines[1];
        const parts = line.trim().split(/\s+/);
        const pid = parts[1];
        
        if (pid) {
          console.log(`Attempting to kill process with PID: ${pid}`);
          exec(`kill -9 ${pid}`, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error killing process: ${error.message}`);
              return;
            }
            console.log(`Process with PID ${pid} killed.`);
          });
        }
      }
    } else {
      console.log(`Port ${PORT} is free.`);
    }
  });
} 