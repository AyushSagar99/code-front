// src/App.tsx
import React, { useState } from 'react';
import ProblemList from './components/ProblemList';
import CodeEditor from './components/CodeEditor';
import SubmissionResults from './components/SubmissionResults';
import type { Problem } from './types';

const App: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [currentSubmission, setCurrentSubmission] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Code Judge
            </h1>
          </div>
        </div>
      </header>
      
      <div className="flex h-[calc(100vh-80px)]">
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <ProblemList 
            onProblemSelect={setSelectedProblem}
            selectedProblem={selectedProblem}
          />
        </div>
        
        <div className="flex-1 flex flex-col">
          {selectedProblem ? (
            <>
              <div className="flex-1 overflow-hidden">
                <CodeEditor 
                  problem={selectedProblem}
                  onSubmissionCreated={setCurrentSubmission}
                />
              </div>
              
              {currentSubmission && (
                <div className="h-80 border-t border-gray-200 dark:border-gray-700 overflow-y-auto">
                  <SubmissionResults submissionId={currentSubmission} />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select a problem to start coding!
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
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