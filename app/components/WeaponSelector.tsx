import React from 'react';
import { WeaponType } from '../game/entities/Weapons';

interface WeaponSelectorProps {
  currentWeapon: WeaponType;
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
  onWeaponSelect: (weapon: WeaponType) => void;
  onReload: () => void;
}

export function WeaponSelector({ 
  currentWeapon, 
  ammo, 
  maxAmmo, 
  isReloading,
  onWeaponSelect, 
  onReload 
}: WeaponSelectorProps) {
  const weapons = [
    { type: WeaponType.PISTOL, key: '1', name: 'Pistol' },
    { type: WeaponType.SHOTGUN, key: '2', name: 'Shotgun' },
    { type: WeaponType.RIFLE, key: '3', name: 'Rifle' },
    { type: WeaponType.ROCKET_LAUNCHER, key: '4', name: 'Rocket' }
  ];

  return (
    <div className="absolute bottom-20 right-4 bg-black bg-opacity-70 text-white p-2 rounded">
      <div className="flex flex-col gap-2">
        {weapons.map(weapon => (
          <button
            key={weapon.type}
            onClick={() => onWeaponSelect(weapon.type)}
            className={`px-3 py-1 text-sm rounded flex items-center justify-between ${
              currentWeapon === weapon.type 
                ? 'bg-blue-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <span className="mr-2">{weapon.key}</span>
            <span>{weapon.name}</span>
          </button>
        ))}
        
        <div className="mt-2 text-center">
          <div className="mb-1">
            Ammo: {ammo}/{maxAmmo}
          </div>
          <button
            onClick={onReload}
            disabled={isReloading || ammo === maxAmmo}
            className={`px-3 py-1 text-sm rounded w-full ${
              isReloading 
                ? 'bg-yellow-600' 
                : ammo === maxAmmo 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {isReloading ? 'Reloading...' : 'Reload (R)'}
          </button>
        </div>
      </div>
    </div>
  );
} 