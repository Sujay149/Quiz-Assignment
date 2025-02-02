export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
  category: string;
}

export interface QuizState {
  currentQuestion: number;
  score: number;
  answers: Record<number, string>;
  correctAnswers: Record<number, string>;
  timeRemaining: number;
  totalResponseTime: number;
  streak: number;
  bestStreak: number;
  badges: string[];
  highScore: number;
  questionsOrder: number[];
}

export interface HighScore {
  score: number;
  date: string;
  accuracy: number;
  streak: number;
}