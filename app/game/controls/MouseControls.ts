import * as THREE from "three";

export function setupMouseControls(
  camera: THREE.Camera, 
  mountRef: React.RefObject<HTMLDivElement>
): {
  cleanup: () => void;
} {
  let isPointerLocked = false;

  const handleMouseMove = (event: MouseEvent) => {
    if (!isPointerLocked) return;
    
    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;
    
    // Adjust rotation sensitivity
    const sensitivity = 0.002;
    
    // Update the camera direction using quaternions for smoother rotation
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    
    // Get current camera rotation
    euler.setFromQuaternion(camera.quaternion);
    
    // Apply mouse movement (with inverted Y for natural feel)
    euler.y -= movementX * sensitivity;
    euler.x -= movementY * sensitivity;
    
    // Clamp vertical rotation to prevent flipping
    euler.x = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, euler.x));
    
    // Apply the new rotation
    camera.quaternion.setFromEuler(euler);
  };

  // Pointer lock for better mouse controls
  const requestPointerLock = () => {
    mountRef.current?.requestPointerLock();
  };

  const handlePointerLockChange = () => {
    isPointerLocked = document.pointerLockElement === mountRef.current;
  };

  window.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('pointerlockchange', handlePointerLockChange);
  mountRef.current?.addEventListener('click', requestPointerLock);

  return {
    cleanup: () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      mountRef.current?.removeEventListener('click', requestPointerLock);
    }
  };
}

export function handleShoot(
  camera: THREE.Camera,
  scene: THREE.Scene,
  bullets: THREE.Mesh[],
  createBulletFn: (camera: THREE.Camera, scene: THREE.Scene) => THREE.Mesh
): void {
  const bullet = createBulletFn(camera, scene);
  bullets.push(bullet);
} 