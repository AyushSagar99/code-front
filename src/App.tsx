// src/App.tsx - Meta Blue Theme
import React, { useState } from 'react';
import ProblemList from './components/ProblemList';
import CodeEditor from './components/CodeEditor';
import SubmissionResults from './components/SubmissionResults';
import type { Problem } from './types';

const App: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [currentSubmission, setCurrentSubmission] = useState<string | null>(null);

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 border-b border-blue-500 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-white text-lg font-semibold">Code Judge</h1>
            <nav className="flex items-center space-x-6">
              <a href="#" className="text-blue-100 hover:text-white text-sm transition-colors">Problem List</a>
              <a href="#" className="text-blue-100 hover:text-white text-sm transition-colors">Contest</a>
              <a href="#" className="text-blue-100 hover:text-white text-sm transition-colors">Discuss</a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-blue-100 hover:text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 5h7V2l5 5-5 5V9H4z" />
              </svg>
            </button>
            <button className="text-blue-100 hover:text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-blue-50 border-r border-blue-200">
          <ProblemList 
            onProblemSelect={setSelectedProblem}
            selectedProblem={selectedProblem}
          />
        </div>
        
        {/* Main Panel */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedProblem ? (
            <>
              <div className="flex-1 overflow-hidden">
                <CodeEditor 
                  problem={selectedProblem}
                  onSubmissionCreated={setCurrentSubmission}
                />
              </div>
              
              {currentSubmission && (
                <div className="h-80 border-t border-blue-200 overflow-y-auto bg-white">
                  <SubmissionResults submissionId={currentSubmission} />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Select a problem to start coding!
                </h2>
                <p className="text-gray-600">
                  Choose a problem from the sidebar to begin your coding challenge.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;