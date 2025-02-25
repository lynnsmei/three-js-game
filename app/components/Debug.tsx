import React from 'react';
import * as THREE from 'three';
import type { KeyState } from '../game/utils/types';

interface DebugProps {
  camera: THREE.Camera;
  targets: THREE.Mesh[];
  bullets: THREE.Mesh[];
  keyState: KeyState;
  lastFrameTime: number;
}

export function Debug({ camera, targets, bullets, keyState, lastFrameTime }: DebugProps) {
  return (
    <div className="absolute bottom-20 left-4 bg-black bg-opacity-70 text-white p-2 rounded text-xs font-mono">
      <div>Position: X: {camera.position.x.toFixed(2)}, Y: {camera.position.y.toFixed(2)}, Z: {camera.position.z.toFixed(2)}</div>
      <div>Rotation: X: {(camera.rotation.x * 180 / Math.PI).toFixed(2)}°, Y: {(camera.rotation.y * 180 / Math.PI).toFixed(2)}°</div>
      <div>FPS: {Math.round(1000 / (performance.now() - lastFrameTime))}</div>
      <div>Targets: {targets.length}, Bullets: {bullets.length}</div>
      <div>Keys: {Object.entries(keyState).filter(([_, v]) => v).map(([k]) => k).join(', ')}</div>
    </div>
  );
} 