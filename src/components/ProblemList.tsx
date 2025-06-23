// src/components/ProblemList.tsx - Meta Blue Theme
import React, { useState, useEffect } from 'react';
import type { Problem } from '../types';

interface ProblemListProps {
  onProblemSelect: (problem: Problem) => void;
  selectedProblem: Problem | null;
}

const ProblemList: React.FC<ProblemListProps> = ({ onProblemSelect, selectedProblem }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProblems = async (): Promise<void> => {
      try {
        const response = await fetch('http://localhost:3001/api/problems');
        if (!response.ok) {
          throw new Error('Failed to fetch problems');
        }
        const data: Problem[] = await response.json();
        setProblems(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Error fetching problems:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const getDifficultyColor = (difficulty: Problem['difficulty']): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-50 h-full overflow-y-auto">
        <div className="p-4 border-b border-blue-200 bg-white">
          <h2 className="text-gray-900 font-semibold">Problem List</h2>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-blue-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-blue-50 h-full overflow-y-auto">
        <div className="p-4 border-b border-blue-200 bg-white">
          <h2 className="text-gray-900 font-semibold">Problem List</h2>
        </div>
        <div className="p-4">
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-red-600 mb-2 font-medium">Error loading problems</div>
            <div className="text-sm text-gray-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 h-full overflow-y-auto">
      <div className="p-4 border-b border-blue-200 bg-white">
        <h2 className="text-gray-900 font-semibold">
          Problem List ({problems.length})
        </h2>
      </div>
      
      <div className="p-3">
        {problems.map((problem) => (
          <div
            key={problem.id}
            onClick={() => onProblemSelect(problem)}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 mb-2 border ${
              selectedProblem?.id === problem.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white hover:bg-blue-100 border-blue-200 hover:border-blue-300 text-gray-900'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-medium truncate ${
                selectedProblem?.id === problem.id ? 'text-white' : 'text-gray-900'
              }`}>
                {problem.title}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                selectedProblem?.id === problem.id 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : getDifficultyColor(problem.difficulty)
              }`}>
                {problem.difficulty}
              </span>
            </div>
            
            <div className={`flex items-center space-x-4 text-xs ${
              selectedProblem?.id === problem.id ? 'text-blue-100' : 'text-gray-500'
            }`}>
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {problem.timeLimit}ms
              </span>
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                {problem.memoryLimit}MB
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProblemList;