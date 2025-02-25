import React from 'react';

interface GameUIProps {
  score: number;
  timeLeft: number;
  gameOver: boolean;
  onRestart: () => void;
}

export function GameUI({ score, timeLeft, gameOver, onRestart }: GameUIProps) {
  return (
    <>
      {/* Game UI */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
        Score: {score}
      </div>
      
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded">
        Time: {timeLeft}s
      </div>
      
      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.5" />
          <line x1="12" y1="4" x2="12" y2="8" />
          <line x1="12" y1="16" x2="12" y2="20" />
          <line x1="4" y1="12" x2="8" y2="12" />
          <line x1="16" y1="12" x2="20" y2="12" />
        </svg>
      </div>
      
      {/* Game over screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl mb-4">Final Score: {score}</p>
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={onRestart}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </>
  );
} 