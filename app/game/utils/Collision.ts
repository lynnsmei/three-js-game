import * as THREE from "three";

export function checkCollision(position: THREE.Vector3, scene: THREE.Scene): boolean {
  // Check if the player is trying to move outside the map bounds
  const mapSize = 49; // Slightly less than the actual wall position
  if (
    position.x > mapSize || 
    position.x < -mapSize || 
    position.z > mapSize || 
    position.z < -mapSize
  ) {
    return true;
  }
  
  // Check collision with walls and other obstacles
  const playerRadius = 0.5;
  const colliders: THREE.Mesh[] = [];
  
  // Collect all objects with isWall flag
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh && object.userData.isWall) {
      colliders.push(object);
    }
  });
  
  // Create a sphere representing the player
  const playerSphere = new THREE.Sphere(position, playerRadius);
  
  // Check collision with each wall
  for (const collider of colliders) {
    // Get the bounding box of the wall
    const box = new THREE.Box3().setFromObject(collider);
    
    // Check if the player sphere intersects with the wall box
    if (box.intersectsSphere(playerSphere)) {
      return true;
    }
  }
  
  return false;
}

export function findSafeSpawnPosition(scene: THREE.Scene): THREE.Vector3 {
  // Try several potential spawn points
  const potentialSpawns = [
    new THREE.Vector3(0, 2, 30),    // Default spawn
    new THREE.Vector3(20, 2, 30),   // Right side
    new THREE.Vector3(-20, 2, 30),  // Left side
    new THREE.Vector3(0, 2, -30),   // Back side
    new THREE.Vector3(30, 2, 0),    // Far right
    new THREE.Vector3(-30, 2, 0)    // Far left
  ];
  
  // Find the first position that doesn't collide with anything
  for (const position of potentialSpawns) {
    if (!checkCollision(position, scene)) {
      console.log("Found safe spawn at", position);
      return position;
    }
  }
  
  // If all predefined positions fail, try random positions
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 25 + Math.random() * 20;
    const position = new THREE.Vector3(
      Math.sin(angle) * distance,
      2,
      Math.cos(angle) * distance
    );
    
    if (!checkCollision(position, scene)) {
      console.log("Found random safe spawn at", position);
      return position;
    }
  }
  
  // If all else fails, use a high position to avoid being stuck
  console.log("Using fallback spawn position");
  return new THREE.Vector3(0, 10, 30);
} 