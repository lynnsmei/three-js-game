import * as THREE from "three";
import type { KeyState } from "../utils/types";
import { checkCollision } from "../utils/Collision";

export function setupKeyboardControls(
  keyState: KeyState,
  setDebug: (value: boolean | ((prevState: boolean) => boolean)) => void
): {
  cleanup: () => void;
} {
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case 'w': keyState.w = true; break;
      case 'a': keyState.a = true; break;
      case 's': keyState.s = true; break;
      case 'd': keyState.d = true; break;
      case 'f1': 
        // Toggle debug mode
        setDebug(prev => !prev);
        event.preventDefault();
        break;
    }
  };
  
  const handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case 'w': keyState.w = false; break;
      case 'a': keyState.a = false; break;
      case 's': keyState.s = false; break;
      case 'd': keyState.d = false; break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return {
    cleanup: () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    }
  };
}

export function handleMovement(
  camera: THREE.Camera,
  keyState: KeyState,
  scene: THREE.Scene
): void {
  // Movement vectors
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  forward.y = 0; // Keep movement on the ground plane
  forward.normalize();
  
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  right.y = 0; // Keep movement on the ground plane
  right.normalize();
  
  const moveSpeed = 0.15;
  
  // Apply movement based on key states
  if (keyState.w) {
    const newPosition = camera.position.clone().addScaledVector(forward, moveSpeed);
    if (!checkCollision(newPosition, scene)) {
      camera.position.copy(newPosition);
    }
  }
  if (keyState.s) {
    const newPosition = camera.position.clone().addScaledVector(forward, -moveSpeed);
    if (!checkCollision(newPosition, scene)) {
      camera.position.copy(newPosition);
    }
  }
  if (keyState.a) {
    const newPosition = camera.position.clone().addScaledVector(right, -moveSpeed);
    if (!checkCollision(newPosition, scene)) {
      camera.position.copy(newPosition);
    }
  }
  if (keyState.d) {
    const newPosition = camera.position.clone().addScaledVector(right, moveSpeed);
    if (!checkCollision(newPosition, scene)) {
      camera.position.copy(newPosition);
    }
  }
} 