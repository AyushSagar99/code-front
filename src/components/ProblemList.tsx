// src/components/ProblemList.tsx
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
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Problems</h2>
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Problems</h2>
        <div className="text-center py-8">
          <div className="text-red-600 dark:text-red-400 mb-2">Error loading problems</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Problems ({problems.length})
      </h2>
      
      <div className="space-y-2">
        {problems.map((problem) => (
          <div
            key={problem.id}
            onClick={() => onProblemSelect(problem)}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedProblem?.id === problem.id
                ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-600'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">
                {problem.title}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
            </div>
            
            <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
              <span>⏱️ {problem.timeLimit}ms</span>
              <span>💾 {problem.memoryLimit}MB</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProblemList;