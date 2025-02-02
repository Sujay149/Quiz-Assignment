import React from 'react';
import { Timer, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import type { Question } from '../types';

interface QuizCardProps {
  question: Question;
  selectedAnswer: string | null;
  timeRemaining: number;
  onSelectAnswer: (answer: string) => void;
  isAnswered: boolean;
  correctAnswer: string | null;
}

export function QuizCard({
  question,
  selectedAnswer,
  timeRemaining,
  onSelectAnswer,
  isAnswered,
  correctAnswer,
}: QuizCardProps) {
  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-500">
            {question.category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-500">
            Points: {question.points}
          </span>
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            <Timer size={18} />
            <span className="font-mono font-medium">{timeRemaining}s</span>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {question.question}
      </h2>

      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = isAnswered && option === correctAnswer;
          const isWrong = isAnswered && isSelected && option !== correctAnswer;

          return (
            <button
              key={option}
              onClick={() => !isAnswered && onSelectAnswer(option)}
              disabled={isAnswered}
              className={`
                w-full text-left p-4 rounded-lg transition-all
                ${isSelected ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50 border-gray-200'}
                ${isCorrect ? 'bg-green-50 border-green-500' : ''}
                ${isWrong ? 'bg-red-50 border-red-500' : ''}
                border-2 relative
                ${!isAnswered && 'hover:scale-[1.02] transform transition-transform'}
              `}
            >
              <span className="pr-8">{option}</span>
              {isAnswered && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2">
                  {isCorrect ? (
                    <CheckCircle2 className="text-green-500" size={20} />
                  ) : isWrong ? (
                    <XCircle className="text-red-500" size={20} />
                  ) : null}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}