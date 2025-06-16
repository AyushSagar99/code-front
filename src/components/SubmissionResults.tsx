// src/components/SubmissionResults.tsx
import React, { useState, useEffect } from 'react';
import type { Submission } from '../types';

interface SubmissionResultsProps {
  submissionId: string;
}

const SubmissionResults: React.FC<SubmissionResultsProps> = ({ submissionId }) => {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmission = async (): Promise<void> => {
      try {
        const response = await fetch(`http://localhost:3001/api/submissions/${submissionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch submission');
        }
        
        const data: Submission = await response.json();
        setSubmission(data);
        
        // Poll for updates if still pending/running
        if (data.status === 'PENDING' || data.status === 'RUNNING') {
          setTimeout(fetchSubmission, 2000);
        } else {
          setLoading(false);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error fetching submission:', err);
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [submissionId]);

  const getStatusBadge = (status: Submission['status']): string => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'ERROR':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6">
        <div className="flex items-center justify-center space-x-3">
          <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Evaluating your solution...
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Running test cases, please wait
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error loading results
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {error || 'Please try submitting again'}
          </p>
        </div>
      </div>
    );
  }

  const passedTests = submission.results ? submission.results.filter(r => r.passed).length : 0;
  const totalTests = submission.results ? submission.results.length : 0;
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Submission Results
      </h3>
      
      {/* Status Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(submission.status)}`}>
              {submission.status}
            </span>
            
            {submission.status === 'COMPLETED' && (
              <div className="flex items-center space-x-2">
                {passedTests === totalTests ? (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {passedTests}/{totalTests} test cases passed
                </span>
              </div>
            )}
          </div>
          
          {submission.score !== null && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {submission.score}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">points</div>
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        {submission.results && (
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                successRate === 100 ? 'bg-green-500' : successRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${successRate}%` }}
            ></div>
          </div>
        )}
      </div>
      
      {/* Test Cases Results */}
      {submission.results && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            Test Cases
          </h4>
          
          <div className="space-y-3">
            {submission.results.map((result, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 transition-all ${
                  result.passed 
                    ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20' 
                    : 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Test Case {index + 1}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      result.passed 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300'
                    }`}>
                      {result.passed ? (
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          PASS
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          FAIL
                        </div>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Execution Time:</span>
                    <div className="font-mono text-gray-900 dark:text-white">
                      {result.executionTime.toFixed(2)}ms
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Memory Used:</span>
                    <div className="font-mono text-gray-900 dark:text-white">
                      {result.memoryUsed}KB
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <div className="font-mono text-gray-900 dark:text-white">
                      {result.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Submission Info */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Submitted on {new Date(submission.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default SubmissionResults;