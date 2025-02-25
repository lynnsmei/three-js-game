import React from 'react';
import { WeaponType } from '../game/entities/Weapons';
import { WeaponSelector } from './WeaponSelector';

interface GameUIProps {
  score: number;
  timeLeft: number;
  gameOver: boolean;
  onRestart: () => void;
  currentWeapon: WeaponType;
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
  onWeaponSelect: (weapon: WeaponType) => void;
  onReload: () => void;
}

export function GameUI({ 
  score, 
  timeLeft, 
  gameOver, 
  onRestart,
  currentWeapon,
  ammo,
  maxAmmo,
  isReloading,
  onWeaponSelect,
  onReload
}: GameUIProps) {
  return (
    <>
      {/* Score and time display */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded">
        <div className="text-xl font-bold">Score: {score}</div>
        <div>Time: {timeLeft}s</div>
      </div>
      
      {/* Weapon selector */}
      <WeaponSelector 
        currentWeapon={currentWeapon}
        ammo={ammo}
        maxAmmo={maxAmmo}
        isReloading={isReloading}
        onWeaponSelect={onWeaponSelect}
        onReload={onReload}
      />
      
      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="2" fill="white" />
          <line x1="12" y1="6" x2="12" y2="10" stroke="white" strokeWidth="2" />
          <line x1="12" y1="14" x2="12" y2="18" stroke="white" strokeWidth="2" />
          <line x1="6" y1="12" x2="10" y2="12" stroke="white" strokeWidth="2" />
          <line x1="14" y1="12" x2="18" y2="12" stroke="white" strokeWidth="2" />
        </svg>
      </div>
      
      {/* Game over screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Game Over</h2>
            <p className="text-xl text-white mb-6">Final Score: {score}</p>
            <button 
              onClick={onRestart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </>
  );
} 