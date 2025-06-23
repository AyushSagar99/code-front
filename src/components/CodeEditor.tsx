// src/components/CodeEditor.tsx - Meta Blue Theme - Optimized for fast submissions
import React, { useState, useRef, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import type { Problem, Language, LanguageOption, SubmissionRequest, SubmissionResponse } from '../types';

interface CodeEditorProps {
  problem: Problem;
  onSubmissionCreated: (submissionId: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ problem, onSubmissionCreated }) => {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<Language>('javascript');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const languageTemplates: Record<Language, string> = {
    javascript: '',
    python: '',
    java: '',
    cpp: '',
    c: ''
  };

  useEffect(() => {
    setCode(languageTemplates[language]);
  }, [language]);

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading problem...
          </h2>
          <p className="text-gray-600">
            Please wait while we load the problem details.
          </p>
        </div>
      </div>
    );
  }

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    monaco.editor.defineTheme('meta-blue', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A737D' },
        { token: 'keyword', foreground: '1976D2' },
        { token: 'string', foreground: '0D7377' },
        { token: 'number', foreground: 'E91E63' },
        { token: 'variable', foreground: '1A1A1A' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#1A1A1A',
        'editorLineNumber.foreground': '#9E9E9E',
        'editor.selectionBackground': '#E3F2FD',
        'editor.lineHighlightBackground': '#F5F5F5',
        'editorCursor.foreground': '#1976D2',
      }
    });
    
    monaco.editor.setTheme('meta-blue');
    setIsEditorReady(true);
  };

  // ✅ FAST SUBMISSION with immediate response + background processing
  const handleSubmitAsync = async (): Promise<void> => {
    if (!code.trim()) {
      alert('Please write some code before submitting');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);
    setShowResult(false);
    const startTime = Date.now();
    
    try {
      const submissionData: SubmissionRequest = {
        problemId: problem.id,
        code,
        language,
      };

      // ✅ Use async endpoint for immediate response
      const response = await fetch('http://localhost:3001/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit code');
      }
      
      const result = await response.json();
      onSubmissionCreated(result.submissionId);
      
      // ✅ Start polling for results with fast intervals
      pollForResults(result.submissionId, startTime);
      
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmissionResult({
        status: 'Error',
        passed: false,
        error: error instanceof Error ? error.message : 'Failed to submit code',
        testCaseResults: []
      });
      setShowResult(true);
      setIsSubmitting(false);
    }
  };

  // ✅ INSTANT SUBMISSION with synchronous results
  const handleSubmitSync = async (): Promise<void> => {
    if (!code.trim()) {
      alert('Please write some code before submitting');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);
    setShowResult(false);
    const startTime = Date.now();
    
    try {
      const submissionData: SubmissionRequest = {
        problemId: problem.id,
        code,
        language,
      };

      // ✅ Use sync endpoint for immediate results
      const response = await fetch('http://localhost:3001/api/submissions/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit code');
      }
      
      const result = await response.json();
      const totalTime = Date.now() - startTime;
      
      setExecutionTime(totalTime);
      setSubmissionResult(result);
      setShowResult(true);
      onSubmissionCreated(result.submissionId);
      
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmissionResult({
        status: 'Error',
        passed: false,
        error: error instanceof Error ? error.message : 'Failed to submit code',
        testCaseResults: []
      });
      setShowResult(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Fast polling function
  const pollForResults = async (submissionId: string, startTime: number): Promise<void> => {
    let attempts = 0;
    const maxAttempts = 30;
    let delay = 200; // Start with 200ms
    
    const poll = async () => {
      attempts++;
      
      try {
        const response = await fetch(`http://localhost:3001/api/submissions/${submissionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch submission status');
        }
        
        const submission = await response.json();
        
        if (submission.status === 'COMPLETED' || submission.status === 'ERROR') {
          // ✅ Execution completed
          const totalTime = Date.now() - startTime;
          setExecutionTime(totalTime);
          setSubmissionResult({
            ...submission,
            status: submission.status === 'COMPLETED' ? 'Accepted' : 'Error',
            passed: submission.status === 'COMPLETED' && submission.results?.every((r: any) => r.passed),
            testCaseResults: submission.results || []
          });
          setShowResult(true);
          setIsSubmitting(false);
          return;
        }
        
        // ✅ Still processing, continue polling
        if (attempts < maxAttempts) {
          setTimeout(poll, delay);
          delay = Math.min(delay * 1.2, 1000); // Exponential backoff
        } else {
          throw new Error('Polling timeout');
        }
        
      } catch (error) {
        console.error('Polling error:', error);
        setSubmissionResult({
          status: 'Error',
          passed: false,
          error: 'Failed to get results',
          testCaseResults: []
        });
        setShowResult(true);
        setIsSubmitting(false);
      }
    };
    
    poll();
  };

  const handleCodeChange = (value: string | undefined): void => {
    setCode(value || '');
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setLanguage(event.target.value as Language);
  };

  const languageOptions: LanguageOption[] = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
  ];

  const getDifficultyColor = (difficulty: Problem['difficulty']): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-orange-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Problem Description Panel */}
      <div className="w-1/2 bg-white border-r border-blue-200 flex flex-col">
        <div className="border-b border-blue-200 bg-blue-50">
          <div className="flex space-x-4 text-sm">
            <button className="px-4 py-3 text-blue-600 border-b-2 border-blue-600 bg-white">
              Description
            </button>
            <button className="px-4 py-3 text-gray-600 hover:text-blue-600 transition-colors">
              Editorial
            </button>
            <button className="px-4 py-3 text-gray-600 hover:text-blue-600 transition-colors">
              Solutions
            </button>
            <button className="px-4 py-3 text-gray-600 hover:text-blue-600 transition-colors">
              Submissions
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-gray-900 text-xl font-semibold mb-4">
              {problem.title}
            </h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                problem.difficulty.toLowerCase() === 'easy' ? 'bg-green-100 text-green-600' :
                problem.difficulty.toLowerCase() === 'medium' ? 'bg-orange-100 text-orange-600' :
                'bg-red-100 text-red-600'
              }`}>
                {problem.difficulty}
              </span>
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {problem.timeLimit}ms
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  {problem.memoryLimit}MB
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {problem.description}
          </div>
        </div>
      </div>
      
      {/* Code Editor Panel */}
      <div className="w-1/2 flex flex-col">
        {/* Editor Header */}
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label htmlFor="language-select" className="text-sm font-medium text-gray-700">
                Language:
              </label>
              <select 
                id="language-select"
                value={language} 
                onChange={handleLanguageChange}
                className="bg-white text-gray-900 px-3 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {languageOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="text-gray-500 text-sm">Auto</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Monaco Editor */}
        <div className="flex-1 border border-blue-200">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            loading={
              <div className="flex items-center justify-center h-full bg-white">
                <div className="flex items-center space-x-2 text-gray-600">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading editor...</span>
                </div>
              </div>
            }
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              theme: 'meta-blue',
              padding: { top: 16, bottom: 16 },
              fontFamily: 'Consolas, "Courier New", monospace',
            }}
          />
        </div>
        
        {/* Bottom Controls */}
        <div className="bg-blue-50 border-t border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-blue-300 hover:bg-blue-50 text-sm transition-colors">
                Testcase
              </button>
              <button className="px-4 py-2 text-gray-600 hover:text-blue-600 text-sm transition-colors">
                Test Result
              </button>
              {executionTime > 0 && (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  ⚡ {executionTime}ms
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-gray-600 hover:text-blue-600 text-sm transition-colors border border-blue-300 rounded-lg hover:bg-blue-50">
                Run
              </button>
              
              {/* ✅ Two submit options: Fast async or Instant sync */}
              <button 
                onClick={handleSubmitSync}
                disabled={isSubmitting || !isEditorReady}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSubmitting || !isEditorReady
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Executing...
                  </div>
                ) : (
                  '⚡ Submit'
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Results Panel */}
        {showResult && submissionResult && (
          <div className="bg-white border-t border-blue-200 p-4 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Results {executionTime > 0 && (
                  <span className="text-sm text-green-600 font-normal">
                    ({executionTime}ms)
                  </span>
                )}
              </h3>
              <button 
                onClick={() => setShowResult(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Overall Status */}
            <div className={`mb-4 p-4 rounded-lg border ${
              submissionResult.passed 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  submissionResult.passed ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium">
                  {submissionResult.status} {submissionResult.passed ? '✓' : '✗'}
                </span>
              </div>
              
              {submissionResult.error && (
                <div className="mt-2 text-sm">
                  <strong>Error:</strong> {submissionResult.error}
                </div>
              )}
            </div>
            
            {/* Test Case Results */}
            {submissionResult.testCaseResults && submissionResult.testCaseResults.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Test Cases:</h4>
                {submissionResult.testCaseResults.map((testCase: any, index: number) => (
                  <div key={index} className={`p-3 rounded-lg border text-sm ${
                    testCase.passed 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Test Case {index + 1}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        testCase.passed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {testCase.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div><strong>Input:</strong> {testCase.input}</div>
                      <div><strong>Expected:</strong> {testCase.expectedOutput}</div>
                      <div><strong>Got:</strong> {testCase.actualOutput || 'No output'}</div>
                      {testCase.status && (
                        <div><strong>Status:</strong> {testCase.status}</div>
                      )}
                      {testCase.error && (
                        <div className="text-red-600"><strong>Error:</strong> {testCase.error}</div>
                      )}
                      {testCase.executionTime && (
                        <div><strong>Time:</strong> {testCase.executionTime}ms</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;