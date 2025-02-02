import React, { useState, useEffect } from 'react';
import { Brain, Loader2, Trophy, Star, Timer, Zap } from 'lucide-react';
import { QuizCard } from './components/QuizCard';
import { ProgressBar } from './components/ProgressBar';
import { QuizSummary } from './components/QuizSummary';
import { mockQuestions } from './mockData';
import type { Question, QuizState } from './types';

const QUESTION_TIMER = 30;
const API_URL = 'https://api.jsonserve.com/Uw5CrX';
const API_TIMEOUT = 5000;

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'summary'>('start');
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    score: 0,
    answers: {},
    correctAnswers: {},
    timeRemaining: QUESTION_TIMER,
    totalResponseTime: 0,
    streak: 0,
    bestStreak: 0,
    badges: [],
    highScore: parseInt(localStorage.getItem('quizHighScore') || '0'),
    questionsOrder: [],
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    let timer: number;
    if (gameState === 'playing' && quizState.timeRemaining > 0) {
      timer = window.setInterval(() => {
        setQuizState((prev) => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, quizState.timeRemaining]);

  useEffect(() => {
    if (quizState.timeRemaining === 0) {
      handleNextQuestion();
    }
  }, [quizState.timeRemaining]);

  const shuffleQuestions = (questions: Question[]) => {
    const indices = Array.from({ length: questions.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  };

  const fetchQuestions = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(API_URL, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data) || !data.length || !data.every(isValidQuestion)) {
        throw new Error('Invalid data format received from API');
      }

      setQuestions(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.warn('Failed to fetch questions from API, falling back to mock data:', err);
      setQuestions(mockQuestions);
      setLoading(false);
      setError(null);
    }
  };

  const isValidQuestion = (q: any): q is Question => {
    return (
      typeof q === 'object' &&
      q !== null &&
      typeof q.id === 'number' &&
      typeof q.question === 'string' &&
      Array.isArray(q.options) &&
      q.options.every((opt: any) => typeof opt === 'string') &&
      typeof q.correctAnswer === 'string' &&
      typeof q.points === 'number' &&
      typeof q.category === 'string'
    );
  };

  const startQuiz = () => {
    const questionsOrder = shuffleQuestions(questions);
    // Create a map of correct answers for accuracy calculation
    const correctAnswers = questions.reduce((acc, q) => {
      acc[q.id] = q.correctAnswer;
      return acc;
    }, {} as Record<number, string>);

    setGameState('playing');
    setQuizState({
      currentQuestion: 0,
      score: 0,
      answers: {},
      correctAnswers,
      timeRemaining: QUESTION_TIMER,
      totalResponseTime: 0,
      streak: 0,
      bestStreak: 0,
      badges: [],
      highScore: parseInt(localStorage.getItem('quizHighScore') || '0'),
      questionsOrder,
    });
  };

  const handleAnswer = (answer: string) => {
    const currentQ = questions[quizState.questionsOrder[quizState.currentQuestion]];
    const isCorrect = answer === currentQ.correctAnswer;
    const timeBonus = Math.floor(quizState.timeRemaining / 3);
    const streakBonus = Math.floor(quizState.streak / 3) * 5;
    const points = isCorrect ? currentQ.points + timeBonus + streakBonus : 0;

    const newScore = quizState.score + points;
    const newStreak = isCorrect ? quizState.streak + 1 : 0;
    const newBestStreak = Math.max(quizState.bestStreak, newStreak);
    const timeSpent = QUESTION_TIMER - quizState.timeRemaining;

    // Update high score if necessary
    if (newScore > quizState.highScore) {
      localStorage.setItem('quizHighScore', newScore.toString());
    }

    // Award badges based on achievements
    const newBadges = [...quizState.badges];
    if (newStreak === 3) newBadges.push('🔥 Hot Streak');
    if (newScore >= 100) newBadges.push('🌟 Century');
    if (timeBonus >= 8) newBadges.push('⚡ Speed Demon');
    if (newBestStreak >= 5) newBadges.push('🎯 Precision Master');
    if (timeSpent < 5) newBadges.push('⚡ Quick Thinker');

    setQuizState((prev) => ({
      ...prev,
      score: newScore,
      answers: { ...prev.answers, [currentQ.id]: answer },
      streak: newStreak,
      bestStreak: newBestStreak,
      badges: [...new Set(newBadges)], // Remove duplicates
      highScore: Math.max(newScore, prev.highScore),
      totalResponseTime: prev.totalResponseTime + timeSpent,
    }));

    setTimeout(handleNextQuestion, 1500);
  };

  const handleNextQuestion = () => {
    if (quizState.currentQuestion === questions.length - 1) {
      setGameState('summary');
    } else {
      setQuizState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        timeRemaining: QUESTION_TIMER,
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-blue-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading quiz...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg max-w-md text-center">
          <p className="font-semibold">Error loading quiz:</p>
          <p>{error}</p>
          <button
            onClick={fetchQuestions}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <Brain className="w-16 h-16 text-blue-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to the Quiz Challenge!
          </h1>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Test your knowledge with our interactive quiz. Answer quickly for bonus points
            and build your streak for special achievements!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">High Score</h3>
              <p className="text-blue-600 font-bold">{quizState.highScore}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <Star className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Earn Badges</h3>
              <p className="text-green-600">Complete achievements</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <Timer className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Time Bonus</h3>
              <p className="text-amber-600">Answer fast for extra points</p>
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'summary') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <QuizSummary
          state={quizState}
          totalQuestions={questions.length}
          onRetry={startQuiz}
        />
      </div>
    );
  }

  const currentQuestion = questions[quizState.questionsOrder[quizState.currentQuestion]];
  const selectedAnswer = quizState.answers[currentQuestion.id] || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 py-8">
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">Score: {quizState.score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <span className="font-semibold">Streak: {quizState.streak}</span>
          </div>
        </div>
      </div>
      
      <ProgressBar
        current={quizState.currentQuestion + 1}
        total={questions.length}
      />
      <QuizCard
        question={currentQuestion}
        selectedAnswer={selectedAnswer}
        timeRemaining={quizState.timeRemaining}
        onSelectAnswer={handleAnswer}
        isAnswered={!!selectedAnswer}
        correctAnswer={selectedAnswer ? currentQuestion.correctAnswer : null}
      />
    </div>
  );
}

export default App;