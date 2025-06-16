// src/types.ts

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number;
  memoryLimit: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TestCase {
  id: string;
  problemId: string;
  input: string;
  output: string;
  isHidden: boolean;
  points: number;
}

export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  executionTime: number;
  memoryUsed: number;
  status: string;
  output?: string;
  error?: string;
}

export interface Submission {
  id: string;
  problemId: string;
  code: string;
  language: Language;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR';
  score: number | null;
  results: TestCaseResult[] | null;
  createdAt: string;
}

export type Language = 'javascript' | 'python' | 'java' | 'cpp' | 'c';

export interface LanguageOption {
  value: Language;
  label: string;
}

export interface SubmissionRequest {
  problemId: string;
  code: string;
  language: Language;
}

export interface SubmissionResponse {
  submissionId: string;
  status: string;
}