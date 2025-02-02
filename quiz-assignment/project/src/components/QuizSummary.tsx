import React from 'react';
import { Trophy, Award, Zap, Star, Target, Clock, Medal } from 'lucide-react';
import type { QuizState } from '../types';

interface QuizSummaryProps {
  state: QuizState;
  totalQuestions: number;
  onRetry: () => void;
}

export function QuizSummary({ state, totalQuestions, onRetry }: QuizSummaryProps) {
  // Calculate correct answers count
  const correctAnswers = Object.entries(state.answers).filter(([id, answer]) => {
    const questionIndex = state.questionsOrder[parseInt(id)];
    return answer === state.correctAnswers[questionIndex];
  }).length;

  // Calculate accuracy
  const accuracy = (correctAnswers / totalQuestions) * 100;

  // Calculate average response time
  const avgResponseTime = state.totalResponseTime / totalQuestions;

  const message = accuracy >= 80 
    ? "Outstanding Performance! 🎉" 
    : accuracy >= 60 
    ? "Good Job! Keep it up! 👏" 
    : "Nice try! Practice makes perfect! 💪";

  const isNewHighScore = state.score > state.highScore;

  // Calculate performance metrics
  const performanceMetrics = {
    speed: avgResponseTime < 10 ? "Lightning Fast!" : avgResponseTime < 15 ? "Quick!" : "Steady",
    consistency: state.streak >= 5 ? "Excellent" : state.streak >= 3 ? "Good" : "Keep Practicing",
    mastery: accuracy >= 90 ? "Master" : accuracy >= 70 ? "Advanced" : "Learning"
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{message}</h2>
        {isNewHighScore && (
          <div className="text-lg text-blue-600 font-semibold mb-2 animate-bounce">
            🎉 New High Score! 🎉
          </div>
        )}
        <p className="text-gray-600">Here's your detailed performance analysis:</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <Award className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-700">{state.score}</div>
          <div className="text-sm text-blue-600">Total Score</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-700">{accuracy.toFixed(1)}%</div>
          <div className="text-sm text-green-600">Accuracy</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-700">{avgResponseTime.toFixed(1)}s</div>
          <div className="text-sm text-purple-600">Avg. Response Time</div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-700">{state.streak}</div>
          <div className="text-sm text-orange-600">Best Streak</div>
        </div>
      </div>

      <div className="mb-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Medal className="w-5 h-5 text-blue-500" />
          Performance Metrics
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Speed:</span>
            <span className="font-medium text-blue-600">{performanceMetrics.speed}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Consistency:</span>
            <span className="font-medium text-green-600">{performanceMetrics.consistency}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Mastery Level:</span>
            <span className="font-medium text-purple-600">{performanceMetrics.mastery}</span>
          </div>
        </div>
      </div>

      {state.badges.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Achievements Unlocked
          </h3>
          <div className="flex flex-wrap gap-2">
            {state.badges.map((badge, index) => (
              <span
                key={index}
                className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="text-center space-y-4">
        <button
          onClick={onRetry}
          className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors w-full sm:w-auto"
        >
          Try Again
        </button>
        <p className="text-sm text-gray-500">
          Correct Answers: {correctAnswers} out of {totalQuestions}
        </p>
      </div>
    </div>
  );
}