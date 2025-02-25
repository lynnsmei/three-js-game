import * as THREE from "three";
import type { TargetType } from "../utils/types";
import { checkCollision } from "../utils/Collision";

// Define target types with personalities
export const targetTypes: TargetType[] = [
  {
    name: "Grunt",
    color: 0xff0000,
    speed: 0.02,
    health: 50,
    points: 50,
    size: 0.8,
    behavior: 'patrol'
  },
  {
    name: "Tank",
    color: 0x0000ff,
    speed: 0.01,
    health: 200,
    points: 150,
    size: 1.2,
    behavior: 'stationary'
  },
  {
    name: "Scout",
    color: 0x00ff00,
    speed: 0.05,
    health: 25,
    points: 75,
    size: 0.6,
    behavior: 'chase'
  },
  {
    name: "Ninja",
    color: 0x000000,
    speed: 0.03,
    health: 75,
    points: 100,
    size: 0.7,
    behavior: 'teleport'
  }
];

export function createTarget(scene: THREE.Scene): THREE.Mesh {
  // Select a random target type
  const targetType = targetTypes[Math.floor(Math.random() * targetTypes.length)];
  
  // Create different shapes based on target type
  let targetGeometry;
  
  switch(targetType.name) {
    case "Tank":
      targetGeometry = new THREE.BoxGeometry(
        targetType.size, 
        targetType.size, 
        targetType.size
      );
      break;
    case "Scout":
      targetGeometry = new THREE.SphereGeometry(targetType.size / 2, 16, 16);
      break;
    case "Ninja":
      targetGeometry = new THREE.TetrahedronGeometry(targetType.size / 2);
      break;
    default: // Grunt
      targetGeometry = new THREE.ConeGeometry(targetType.size / 2, targetType.size, 8);
  }
  
  const targetMaterial = new THREE.MeshStandardMaterial({ 
    color: targetType.color,
    metalness: 0.3,
    roughness: 0.4,
  });
  
  const target = new THREE.Mesh(targetGeometry, targetMaterial);
  
  // Find a safe spawn position for the target
  const mapSize = 45; // Slightly smaller than the actual map
  let validPosition = false;
  let attempts = 0;
  let finalX = 0;
  let finalZ = 0;
  
  while (!validPosition && attempts < 10) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 10 + Math.random() * 30;
    finalX = Math.sin(angle) * distance;
    finalZ = Math.cos(angle) * distance;
    
    const testPosition = new THREE.Vector3(finalX, 1, finalZ);
    if (!checkCollision(testPosition, scene)) {
      validPosition = true;
    } else {
      attempts++;
    }
  }
  
  target.position.set(
    finalX,
    Math.random() * 3 + 0.5, // Height between 0.5 and 3.5
    finalZ
  );
  
  target.castShadow = true;
  
  // Store target properties in userData
  target.userData = { 
    health: targetType.health,
    type: targetType,
    initialPosition: target.position.clone(),
    movementAngle: Math.random() * Math.PI * 2,
    lastTeleport: 0,
    patrolRadius: 3 + Math.random() * 5
  };
  
  // Add a name label above the target
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#ffffff';
    context.font = 'Bold 24px Arial';
    context.fillText(targetType.name, 10, 40);
    
    const texture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.SpriteMaterial({ map: texture });
    const label = new THREE.Sprite(labelMaterial);
    label.position.y = targetType.size + 0.5;
    label.scale.set(2, 0.5, 1);
    target.add(label);
  }
  
  scene.add(target);
  return target;
}

export function updateTargets(
  targets: THREE.Mesh[], 
  camera: THREE.Camera, 
  scene: THREE.Scene,
  time: number
): void {
  for (const target of targets) {
    const targetData = target.userData;
    const targetType = targetData.type as TargetType;
    
    switch(targetType.behavior) {
      case 'patrol':
        // Move in a circular pattern
        targetData.movementAngle += 0.01;
        const patrolX = targetData.initialPosition.x + Math.cos(targetData.movementAngle) * targetData.patrolRadius;
        const patrolZ = targetData.initialPosition.z + Math.sin(targetData.movementAngle) * targetData.patrolRadius;
        target.position.x = patrolX;
        target.position.z = patrolZ;
        // Make it face the direction of movement
        target.lookAt(patrolX + Math.cos(targetData.movementAngle), target.position.y, patrolZ + Math.sin(targetData.movementAngle));
        break;
        
      case 'chase':
        // Move toward the player if within range
        const distanceToPlayer = target.position.distanceTo(camera.position);
        if (distanceToPlayer < 20) {
          const direction = new THREE.Vector3().subVectors(camera.position, target.position).normalize();
          direction.y = 0; // Keep on the ground
          target.position.addScaledVector(direction, targetType.speed);
          target.lookAt(camera.position);
        }
        break;
        
      case 'teleport':
        // Teleport to a new position every few seconds
        if (time - targetData.lastTeleport > 5000) { // Every 5 seconds
          const angle = Math.random() * Math.PI * 2;
          const distance = 10 + Math.random() * 10;
          target.position.set(
            Math.sin(angle) * distance + camera.position.x,
            Math.random() * 3 + 0.5,
            Math.cos(angle) * distance + camera.position.z
          );
          targetData.lastTeleport = time;
          
          // Add teleport effect
          createTeleportEffect(target.position.clone(), scene, time);
        }
        break;
        
      case 'stationary':
      default:
        // Just rotate in place
        target.rotation.y += 0.01;
        break;
    }
  }
}

function createTeleportEffect(position: THREE.Vector3, scene: THREE.Scene, startTime: number): void {
  const teleportGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const teleportMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
  });
  const teleportEffect = new THREE.Mesh(teleportGeometry, teleportMaterial);
  teleportEffect.position.copy(position);
  scene.add(teleportEffect);
  
  // Animate and remove the effect
  const animateTeleport = () => {
    const elapsed = Date.now() - startTime;
    if (elapsed > 500) {
      scene.remove(teleportEffect);
      teleportGeometry.dispose();
      teleportMaterial.dispose();
      return;
    }
    
    teleportEffect.scale.set(
      1 + elapsed / 250,
      1 + elapsed / 250,
      1 + elapsed / 250
    );
    teleportMaterial.opacity = 0.8 - (elapsed / 500) * 0.8;
    
    requestAnimationFrame(animateTeleport);
  };
  animateTeleport();
} 