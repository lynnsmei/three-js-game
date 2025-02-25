import * as THREE from "three";

export interface TargetType {
  name: string;
  color: number;
  speed: number;
  health: number;
  points: number;
  size: number;
  behavior: 'stationary' | 'patrol' | 'chase' | 'teleport';
}

export interface GameState {
  score: number;
  timeLeft: number;
  gameActive: boolean;
  gameOver: boolean;
  targets: THREE.Mesh[];
  bullets: THREE.Mesh[];
}

export interface KeyState {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
}