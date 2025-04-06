import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionApi, SessionReport } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './SessionReport.css'; // Create this CSS file for styling

interface SessionReportProps {
  onLogout: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9146FF', '#FF4646'];

const SessionReportComponent: React.FC<SessionReportProps> = ({ onLogout }) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<SessionReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const sessionReport = await sessionApi.getSessionReport(parseInt(sessionId));
        setReport(sessionReport);
        setError(null);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to load the session report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [sessionId]);

  const handleBack = () => {
    navigate('/');
  };

  // Format timestamp to readable date
  const formatDateTime = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  // Format duration in seconds to HH:MM:SS
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
      hours > 0 ? hours : null,
      minutes.toString().padStart(hours > 0 ? 2 : 1, '0'),
      secs.toString().padStart(2, '0')
    ].filter(Boolean).join(':');
  };

  // Format score to display with color based on performance
  const getScoreColor = (score?: number) => {
    if (!score) return '#888';
    if (score >= 80) return '#4caf50'; // success/green
    if (score >= 60) return '#ff9800'; // warning/orange
    return '#f44336'; // error/red
  };

  // Convert emotion distribution to pie chart data
  const prepareEmotionChartData = () => {
    if (!report?.emotional_analysis.emotion_distribution) return [];
    
    return Object.entries(report.emotional_analysis.emotion_distribution).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Prepare performance data for bar chart
  const preparePerformanceData = () => {
    if (!report) return [];
    
    return [
      {
        name: 'Problem Solving',
        score: report.overall_assessment.problem_solving_score || 0
      },
      {
        name: 'Code Quality',
        score: report.overall_assessment.code_quality_score || 0
      },
      {
        name: 'Emotional State',
        score: report.overall_assessment.emotional_state_score || 0
      },
      {
        name: 'Overall',
        score: report.overall_assessment.overall_score || 0
      }
    ];
  };

  if (loading) {
    return (
      <div className="report-container">
        <header>
          <nav className="navbar">
            <div className="logo">InterviewXpert</div>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </nav>
        </header>
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>Generating Session Report...</h2>
          <p className="text-secondary">
            Analyzing performance and emotional data from your session
          </p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="report-container">
        <header>
          <nav className="navbar">
            <div className="logo">InterviewXpert</div>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </nav>
        </header>
        <div className="container">
          <div className="error-alert">
            {error || 'Error: Failed to load the report data'}
          </div>
          <button 
            className="back-button"
            onClick={handleBack}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-container">
      <header>
        <nav className="navbar">
          <div className="logo">InterviewXpert</div>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </nav>
      </header>
      
      <div className="container">
        <div className="header-actions">
          <button 
            className="back-button"
            onClick={handleBack}
          >
            Back to Home
          </button>
          <button 
            className="print-button"
            onClick={() => window.print()}
          >
            Print Report
          </button>
        </div>
        
        {/* Report Header */}
        <div className="report-card">
          <h1>Interview Performance Report</h1>
          <p className="session-name">
            {report.session_info.session_name || `Session #${report.session_info.id}`}
          </p>
          
          <div className="session-info-grid">
            <div className="session-info-item">
              <div className="info-label">
                <span className="icon">⏱️</span>
                <span>Start Time</span>
              </div>
              <div>{formatDateTime(report.session_info.start_time)}</div>
            </div>
            
            <div className="session-info-item">
              <div className="info-label">
                <span className="icon">⏱️</span>
                <span>End Time</span>
              </div>
              <div>{formatDateTime(report.session_info.end_time)}</div>
            </div>
            
            <div className="session-info-item">
              <div className="info-label">
                <span className="icon">⏱️</span>
                <span>Duration</span>
              </div>
              <div>{formatDuration(report.session_info.duration)}</div>
            </div>
            
            <div className="session-info-item">
              <div className="info-label">
                <span className="icon">ℹ️</span>
                <span>Status</span>
              </div>
              <span className={`status-chip ${report.session_info.completed ? "success" : "warning"}`}>
                {report.session_info.completed ? "Completed" : "Incomplete"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Overall Score */}
        <div className="report-card">
          <div className="section-header">
            <span className="icon">🏆</span>
            <h2>Overall Performance</h2>
          </div>
          
          <div className="performance-grid">
            <div className="overall-score">
              <h1 style={{color: getScoreColor(report.overall_assessment.overall_score)}}>
                {report.overall_assessment.overall_score?.toFixed(1) || 'N/A'}
              </h1>
              <p className="text-secondary">
                Overall Score (0-100)
              </p>
              
              <div className="score-bars">
                {/* Problem Solving Score */}
                <div className="score-bar-container">
                  <div className="score-bar-header">
                    <span>Problem Solving</span>
                    <span style={{color: getScoreColor(report.overall_assessment.problem_solving_score)}}>
                      {report.overall_assessment.problem_solving_score?.toFixed(1) || 'N/A'}/100
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar" 
                      style={{
                        width: `${report.overall_assessment.problem_solving_score || 0}%`,
                        backgroundColor: getScoreColor(report.overall_assessment.problem_solving_score)
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Code Quality Score */}
                <div className="score-bar-container">
                  <div className="score-bar-header">
                    <span>Code Quality</span>
                    <span style={{color: getScoreColor(report.overall_assessment.code_quality_score)}}>
                      {report.overall_assessment.code_quality_score?.toFixed(1) || 'N/A'}/100
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar" 
                      style={{
                        width: `${report.overall_assessment.code_quality_score || 0}%`,
                        backgroundColor: getScoreColor(report.overall_assessment.code_quality_score)
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Emotional State Score */}
                <div className="score-bar-container">
                  <div className="score-bar-header">
                    <span>Emotional State</span>
                    <span style={{color: getScoreColor(report.overall_assessment.emotional_state_score)}}>
                      {report.overall_assessment.emotional_state_score?.toFixed(1) || 'N/A'}/100
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar" 
                      style={{
                        width: `${report.overall_assessment.emotional_state_score || 0}%`,
                        backgroundColor: getScoreColor(report.overall_assessment.emotional_state_score)
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="chart-container">
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={preparePerformanceData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}/100`, 'Score']} />
                    <Legend />
                    <Bar dataKey="score" name="Score" fill="#2196f3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        
        {/* Strengths and Areas for Improvement */}
        <div className="insights-grid">
          <div className="report-card">
            <div className="section-header">
              <span className="icon">⬆️</span>
              <h2>Strengths</h2>
            </div>
            
            <ul className="insight-list">
              {report.overall_assessment.strengths.map((strength, index) => (
                <li key={index} className="insight-item">
                  <span className="insight-icon success">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="report-card">
            <div className="section-header">
              <span className="icon">⬇️</span>
              <h2>Areas for Improvement</h2>
            </div>
            
            <ul className="insight-list">
              {report.overall_assessment.areas_for_improvement.map((area, index) => (
                <li key={index} className="insight-item">
                  <span className="insight-icon error">!</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Recommendations */}
        <div className="report-card">
          <div className="section-header">
            <span className="icon">💡</span>
            <h2>Recommendations</h2>
          </div>
          
          <ul className="recommendation-list">
            {report.overall_assessment.recommendations.map((recommendation, index) => (
              <li key={index} className="recommendation-item">
                <span className="recommendation-icon">💡</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Question Performance */}
        <div className="report-card">
          <div className="section-header">
            <span className="icon">💻</span>
            <h2>Question Performance</h2>
          </div>
          
          {report.question_performance.length === 0 ? (
            <div className="info-message">
              No question data available for this session.
            </div>
          ) : (
            <div className="questions-container">
              {report.question_performance.map((q, index) => (
                <div className="question-card" key={index}>
                  <div className="question-header">
                    <h3>{q.title}</h3>
                    <span className={`difficulty-tag ${q.difficulty.toLowerCase()}`}>
                      {q.difficulty.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="topics-container">
                    {q.topics.map((topic, idx) => (
                      <span key={idx} className="topic-tag">{topic}</span>
                    ))}
                  </div>
                  
                  <hr className="divider" />
                  
                  <div className="question-stats">
                    <div className="stat-item">
                      <span className="stat-label">Time Spent:</span>
                      <span className="stat-value">{formatDuration(q.time_spent)}</span>
                    </div>
                    
                    <div className="stat-item">
                      <span className="stat-label">Language:</span>
                      <span className="stat-value">{q.language || 'Not specified'}</span>
                    </div>
                    
                    <div className="stat-item">
                      <span className="stat-label">Test Results:</span>
                      <span className="stat-value">
                        {q.test_results.passed !== undefined && q.test_results.total !== undefined ? 
                          `${q.test_results.passed}/${q.test_results.total} passed (${Math.round(q.test_results.pass_rate * 100)}%)` :
                          'No test results'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <hr className="divider" />
                  
                  <h4>Code Quality Metrics:</h4>
                  <div className="code-quality-grid">
                    <div className="code-quality-item">
                      <span className="quality-label">Readability:</span>
                      <span className="quality-value">{q.code_quality.readability.toFixed(1)}/10</span>
                    </div>
                    
                    <div className="code-quality-item">
                      <span className="quality-label">Efficiency:</span>
                      <span className="quality-value">{q.code_quality.efficiency.toFixed(1)}/10</span>
                    </div>
                    
                    <div className="code-quality-item">
                      <span className="quality-label">Correctness:</span>
                      <span className="quality-value">{q.code_quality.correctness.toFixed(1)}/10</span>
                    </div>
                    
                    <div className="code-quality-item">
                      <span className="quality-label">Overall:</span>
                      <span className="quality-value overall">{q.code_quality.overall.toFixed(1)}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Emotional Analysis */}
        <div className="report-card">
          <div className="section-header">
            <span className="icon">🧠</span>
            <h2>Emotional Analysis</h2>
          </div>
          
          <div className="emotion-grid">
            <div className="emotion-chart">
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prepareEmotionChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepareEmotionChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="emotion-stats">
              <h3>Emotional Metrics</h3>
              
              <div className="emotion-metrics">
                <div className="emotion-metric">
                  <span className="metric-label">Average Attention:</span>
                  <span className="metric-value">
                    {report.emotional_analysis.average.attention_level !== undefined ? 
                      `${(report.emotional_analysis.average.attention_level * 100).toFixed(1)}%` : 
                      'N/A'
                    }
                  </span>
                </div>
                
                <div className="emotion-metric">
                  <span className="metric-label">Average Positivity:</span>
                  <span className="metric-value">
                    {report.emotional_analysis.average.positivity_level !== undefined ? 
                      `${(report.emotional_analysis.average.positivity_level * 100).toFixed(1)}%` : 
                      'N/A'
                    }
                  </span>
                </div>
                
                <div className="emotion-metric">
                  <span className="metric-label">Average Arousal:</span>
                  <span className="metric-value">
                    {report.emotional_analysis.average.arousal_level !== undefined ? 
                      `${(report.emotional_analysis.average.arousal_level * 100).toFixed(1)}%` : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
              
              <div className="emotion-assessment">
                <h3>Emotional Assessment</h3>
                <p>
                  {report.emotional_analysis.assessment || 'No assessment available'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionReportComponent; 