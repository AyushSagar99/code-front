// src/components/CodeEditor.tsx
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
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const languageTemplates: Record<Language, string> = {
    javascript: '',
    python: '',
    java: '',
    cpp: '',
    c: ''
  };

  // 🔥 ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  useEffect(() => {
    setCode(languageTemplates[language]);
  }, [language]);

  // ✅ NOW it's safe to do early returns AFTER all hooks
  if (!problem) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Loading problem...
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please wait while we load the problem details.
          </p>
        </div>
      </div>
    );
  }

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure custom theme
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1f2937', // gray-800
        'editor.foreground': '#f9fafb', // gray-50
      }
    });
    
    monaco.editor.setTheme('custom-dark');
    setIsEditorReady(true);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!code.trim()) {
      alert('Please write some code before submitting');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);
    setShowResult(false);
    
    try {
      const submissionData: SubmissionRequest = {
        problemId: problem.id,
        code,
        language,
      };

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
      
      const result: SubmissionResponse = await response.json();
      
      // Set the submission result for display
      setSubmissionResult(result);
      setShowResult(true);
      
      onSubmissionCreated(result.submissionId);
    } catch (error) {
      console.error('Submission failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit code';
      
      // Show error in the result panel
      setSubmissionResult({
        status: 'Error',
        passed: false,
        error: errorMessage,
        testCaseResults: []
      });
      setShowResult(true);
    } finally {
      setIsSubmitting(false);
    }
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
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="flex h-full">
      {/* Problem Description Panel */}
      <div className="w-1/2 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {problem.title}
            </h2>
            
            <div className="flex items-center space-x-4 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
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
          
          <div className="prose dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
              {problem.description}
            </pre>
          </div>
        </div>
      </div>
      
      {/* Code Editor Panel */}
      <div className="w-1/2 flex flex-col bg-gray-800">
        {/* Editor Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label htmlFor="language-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Language:
              </label>
              <select 
                id="language-select"
                value={language} 
                onChange={handleLanguageChange}
                className="block w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {languageOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !isEditorReady}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                isSubmitting || !isEditorReady
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                'Submit Solution'
              )}
            </button>
          </div>
        </div>
        
        {/* Monaco Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            loading={
              <div className="flex items-center justify-center h-full bg-gray-800">
                <div className="flex items-center space-x-2 text-gray-400">
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
              theme: 'custom-dark',
              padding: { top: 16, bottom: 16 },
            }}
          />
        </div>
        
        {/* Results Panel */}
        {showResult && submissionResult && (
          <div className="bg-gray-900 border-t border-gray-700 p-4 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Submission Results</h3>
              <button 
                onClick={() => setShowResult(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Overall Status */}
            <div className={`mb-4 p-3 rounded-lg border ${
              submissionResult.passed 
                ? 'bg-green-900 border-green-700 text-green-300' 
                : 'bg-red-900 border-red-700 text-red-300'
            }`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  submissionResult.passed ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className="font-medium">
                  {submissionResult.status} {submissionResult.passed ? '✓' : '✗'}
                </span>
              </div>
              
              {/* Show error details if submission failed */}
              {submissionResult.error && (
                <div className="mt-2 text-sm">
                  <strong>Error:</strong> {submissionResult.error}
                </div>
              )}
            </div>
            
            {/* Test Case Results */}
            {submissionResult.testCaseResults && submissionResult.testCaseResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Test Cases:</h4>
                {submissionResult.testCaseResults.map((testCase: any, index: number) => (
                  <div key={index} className={`p-3 rounded border text-sm ${
                    testCase.passed 
                      ? 'bg-green-900 border-green-700 text-green-200' 
                      : 'bg-red-900 border-red-700 text-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Test Case {index + 1}</span>
                      <span className={testCase.passed ? 'text-green-400' : 'text-red-400'}>
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
                        <div className="text-red-400"><strong>Error:</strong> {testCase.error}</div>
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